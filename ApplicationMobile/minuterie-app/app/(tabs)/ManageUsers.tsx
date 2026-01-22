import { useManageUsers, User } from "@/hooks/useManageUsers";
import { useUserRole } from "@/hooks/useUserRole";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ManageUsers() {
  const { role, loading } = useUserRole();
  const { users = [], addUser, changeRole, removeUser } = useManageUsers();

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "standard">("standard");
  
  // Nouveau: Modal pour demander le mot de passe admin
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  if (loading) return <Text>Chargement...</Text>;
  if (role !== "admin") return <Redirect href="/(tabs)/lighting" />;

  // Filtrage sécurisé
  const filteredUsers = users.filter(
    (user) =>
      (user.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (user.role ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleChangeRole = async (user: User) => {
    const updatedRole: "admin" | "standard" =
      user.role === "admin" ? "standard" : "admin";
    await changeRole(user.id, updatedRole);
  };

  const handleRemoveUser = async (user: User) => {
    Alert.alert(
      "Confirmer",
      `Voulez-vous vraiment supprimer ${user.name ?? "cet utilisateur"} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => removeUser(user.id) },
      ]
    );
  };

  // Validation et demande du mot de passe admin
  const handleAddUserRequest = () => {
    if (!newName || !newEmail || !newPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert("Erreur", "Veuillez entrer un email valide");
      return;
    }

    // Fermer le modal d'ajout et ouvrir le modal de confirmation
    setModalVisible(false);
    setShowPasswordModal(true);
  };

  // Confirmation avec mot de passe admin
  const handleConfirmAddUser = async () => {
    if (!adminPassword) {
      Alert.alert("Erreur", "Veuillez entrer votre mot de passe administrateur");
      return;
    }

    setShowPasswordModal(false);

    try {
      // Appeler addUser avec le mot de passe admin
      await addUser(newEmail, newPassword, newName, newRole, adminPassword);
      
      // Réinitialiser les champs
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("standard");
      setAdminPassword("");
      
      Alert.alert("Succès", "Utilisateur ajouté avec succès !");
    } catch (error: any) {
      console.error(error);
      
      let errorMessage = "Impossible d'ajouter l'utilisateur.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Cet email est déjà utilisé";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email invalide";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Mot de passe trop faible";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Mot de passe administrateur incorrect";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Erreur", errorMessage);
      
      // Réouvrir le modal d'ajout
      setModalVisible(true);
    } finally {
      setAdminPassword("");
    }
  };

  const handleCancelPasswordModal = () => {
    setShowPasswordModal(false);
    setAdminPassword("");
    // Réouvrir le modal d'ajout
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* TopBar */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>User Management</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search users by name or role..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Users List */}
      <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: 120 }}>
        {filteredUsers.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#60758a" }}>
            Aucun utilisateur trouvé
          </Text>
        )}

        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name ?? "Unnamed"}</Text>
              <Text style={styles.userRole}>{user.role ?? "Unknown"}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleChangeRole(user)}>
                <Text style={styles.actionText}>Changer rôle</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveUser(user)}>
                <Text style={[styles.actionText, { color: "red" }]}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add User Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      {/* Add User Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un utilisateur</Text>
            <TextInput
              placeholder="Nom"
              value={newName}
              onChangeText={setNewName}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Email"
              value={newEmail}
              onChangeText={setNewEmail}
              style={styles.modalInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Mot de passe (min. 6 caractères)"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.modalInput}
              secureTextEntry
            />

            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  newRole === "admin" && styles.roleButtonSelected,
                ]}
                onPress={() => setNewRole("admin")}
              >
                <Text
                  style={[
                    styles.roleText,
                    newRole === "admin" && styles.roleTextSelected,
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  newRole === "standard" && styles.roleButtonSelected,
                ]}
                onPress={() => setNewRole("standard")}
              >
                <Text
                  style={[
                    styles.roleText,
                    newRole === "standard" && styles.roleTextSelected,
                  ]}
                >
                  Standard
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.addButton, { flex: 1 }]}
                onPress={handleAddUserRequest}
              >
                <Text style={styles.addButtonText}>Ajouter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, { flex: 1, backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.addButtonText, { color: "#111" }]}>Annuler</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.noteText}>
              Note : Vous devrez confirmer votre mot de passe admin
            </Text>
          </View>
        </View>
      </Modal>

      {/* Password Confirmation Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="fade"
        transparent
        onRequestClose={handleCancelPasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmation requise</Text>
            <Text style={styles.confirmText}>
              Pour des raisons de sécurité, veuillez entrer votre mot de passe administrateur :
            </Text>
            
            <TextInput
              placeholder="Votre mot de passe admin"
              value={adminPassword}
              onChangeText={setAdminPassword}
              style={styles.modalInput}
              secureTextEntry
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.addButton, { flex: 1, backgroundColor: "#ccc" }]}
                onPress={handleCancelPasswordModal}
              >
                <Text style={[styles.addButtonText, { color: "#111" }]}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.addButton, { flex: 1 }]}
                onPress={handleConfirmAddUser}
              >
                <Text style={styles.addButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  topBar: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  searchContainer: { padding: 16 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  main: { flex: 1, paddingHorizontal: 16 },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#111418" },
  userRole: { fontSize: 14, color: "#60758a", marginTop: 4 },
  actions: { flexDirection: "row", gap: 12 },
  actionText: { fontWeight: "bold", color: "#0d7fff" },
  addButtonContainer: { position: "absolute", bottom: 16, left: 16, right: 16 },
  addButton: {
    backgroundColor: "#0d7fff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  roleContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  roleButton: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "#ccc" },
  roleButtonSelected: { backgroundColor: "#0d7fff", borderColor: "#0d7fff" },
  roleText: { fontWeight: "bold", color: "#111" },
  roleTextSelected: { color: "#fff" },
  modalActions: { flexDirection: "row", gap: 12 },
  noteText: { 
    fontSize: 12, 
    color: "#60758a", 
    textAlign: "center", 
    marginTop: 12,
    fontStyle: "italic"
  },
  confirmText: {
    fontSize: 14,
    color: "#60758a",
    textAlign: "center",
    marginBottom: 16,
  },
});