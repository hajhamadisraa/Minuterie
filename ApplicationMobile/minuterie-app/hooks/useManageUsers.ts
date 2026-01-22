import { db } from "@/firebase/config";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "standard";
}

export function useManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger la liste des utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList: User[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        usersList.push({
          id: docSnap.id, // ID du document Firestore
          name: data.name || data.nom || "Unnamed",
          email: data.email || "",
          role: data.role || "standard",
        });
      });

      setUsers(usersList);
      console.log("Utilisateurs chargés:", usersList);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Ajouter un utilisateur sans déconnecter l'admin
   */
  const addUser = async (
    email: string,
    password: string,
    name: string,
    role: "admin" | "standard",
    adminPassword: string
  ) => {
    const auth = getAuth();
    const currentAdmin = auth.currentUser;

    if (!currentAdmin) {
      throw new Error("Vous devez être connecté en tant qu'administrateur");
    }

    const adminEmail = currentAdmin.email;

    if (!adminEmail) {
      throw new Error("Email administrateur introuvable");
    }

    try {
      console.log("Création du nouvel utilisateur...");

      // 1. Créer le nouvel utilisateur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      console.log("Utilisateur créé avec UID:", newUser.uid);

      // 2. Ajouter les données dans Firestore avec l'UID comme ID de document
      await setDoc(doc(db, "users", newUser.uid), {
        email: email,
        name: name,
        role: role,
        uid: newUser.uid,
        createdAt: new Date().toISOString(),
        createdBy: currentAdmin.uid,
      });

      console.log("Données Firestore ajoutées");

      // 3. Déconnecter le nouvel utilisateur
      await signOut(auth);

      console.log("Nouvel utilisateur déconnecté");

      // 4. Reconnecter l'admin
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

      console.log("Admin reconnecté");

      // 5. Rafraîchir la liste des utilisateurs
      await fetchUsers();

      return {
        success: true,
        uid: newUser.uid,
        message: "Utilisateur créé avec succès",
      };
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);

      // En cas d'erreur, essayer de reconnecter l'admin
      if (adminEmail && adminPassword) {
        try {
          await signOut(auth);
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          console.log("Admin reconnecté après erreur");
        } catch (reconnectError) {
          console.error("Impossible de reconnecter l'admin:", reconnectError);
        }
      }

      throw error;
    }
  };

  /**
   * Changer le rôle d'un utilisateur
   */
  const changeRole = async (userId: string, newRole: "admin" | "standard") => {
    try {
      console.log(`Changement de rôle pour l'utilisateur ${userId} vers ${newRole}`);
      
      // Vérifier que l'utilisateur existe
      const userDoc = doc(db, "users", userId);
      
      await updateDoc(userDoc, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      // Mettre à jour localement
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      console.log(`Rôle de l'utilisateur ${userId} changé en ${newRole}`);
      
      // Optionnel: rafraîchir depuis la base de données
      await fetchUsers();
      
    } catch (error) {
      console.error("Erreur lors du changement de rôle:", error);
      throw error;
    }
  };

  /**
   * Supprimer un utilisateur
   * Note: Cela supprime seulement le document Firestore,
   * pas le compte Firebase Authentication
   */
  const removeUser = async (userId: string) => {
    try {
      console.log(`Suppression de l'utilisateur ${userId}`);
      
      const userDoc = doc(db, "users", userId);
      await deleteDoc(userDoc);

      // Mettre à jour localement
      setUsers((prev) => prev.filter((user) => user.id !== userId));

      console.log(`Utilisateur ${userId} supprimé`);
      
      // Optionnel: rafraîchir depuis la base de données
      await fetchUsers();
      
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      throw error;
    }
  };

  return {
    users,
    loading,
    addUser,
    changeRole,
    removeUser,
    fetchUsers,
  };
}