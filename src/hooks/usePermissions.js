// src/hooks/usePermissions.js
import { useState, useEffect } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      const db = getFirestore();
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setRole(data.role || "sub_user");
        setPermissions(data.permissions || {});
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const can = (action) => {
    if (role === "admin") return true; // admin can do everything
    return permissions?.[action] === true;
  };

  return { role, permissions, can, loading, isAdmin: role === "admin" };
};