import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
 
export const useSubAccount = (authUser) => {
  const [parentUid, setParentUid] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!authUser?.uid) { setLoading(false); return; }
 
    const resolve = async () => {
      try {
        const db = getFirestore();
        const snap = await getDoc(doc(db, "users", authUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || "owner");
          setParentUid(data.parentUid || null);
          setPermissions(data.permissions || []);
        }
      } catch (e) {
        console.error("useSubAccount error:", e);
      } finally {
        setLoading(false);
      }
    };
 
    resolve();
  }, [authUser?.uid]);
 
  return { parentUid, permissions, role, loading };
};