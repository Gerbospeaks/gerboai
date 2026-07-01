import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
export function useBusinessInfo(uid) {
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid, "settings", "businessInfo"));
        if (!cancelled) {
          setBusinessInfo(snap.exists() ? snap.data() : {});
        }
      } catch (err) {
        console.error("useBusinessInfo load:", err);
        if (!cancelled) setBusinessInfo({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  return { businessInfo: businessInfo ?? {}, loading };
}

export default useBusinessInfo;