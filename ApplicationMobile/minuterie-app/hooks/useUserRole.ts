import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useUserRole() {
  const [role, setRole] = useState<"admin" | "standard" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        setRole(
          snap.exists()
            ? (snap.data().role as "admin" | "standard")
            : "standard"
        );
      } catch {
        setRole("standard"); // offline fallback
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  return { role, loading };
}
