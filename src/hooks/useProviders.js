// src/hooks/useProviders.js
// Plugs into your existing firebase.js — no changes needed there.
// Providers collection: providers/{auto-id}

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * useProviders(industryFilter)
 * Replaces the hardcoded PROVIDERS array in PublicMarketplace.jsx.
 * Real-time — the marketplace updates the moment any provider
 * changes their data.
 */
export function useProviders(industryFilter = "all") {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    setLoading(true);

    const base = [
      collection(db, "providers"),
      where("active", "==", true),
    ];

    const q =
      industryFilter === "all"
        ? query(...base, orderBy("featured", "desc"), orderBy("rating", "desc"))
        : query(...base, where("industry", "==", industryFilter), orderBy("featured", "desc"), orderBy("rating", "desc"));

    const unsub = onSnapshot(
  q,
  (snap) => {
    const now = new Date();
    setProviders(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => {
          if (!p.expiresAt) return true;             // no expiry = always show
          return p.expiresAt.toDate() > now;          // hide if expired
        })
    );
    setLoading(false);
    setError(null);
  },
  (err) => {
    console.error("useProviders:", err.message);
    setError(err.message);
    setLoading(false);
  },
);

    return () => unsub();
  }, [industryFilter]);

  return { providers, loading, error };
}

/**
 * useMyProviderListing(uid)
 * On the provider's own dashboard — live subscription to their listing.
 */
export function useMyProviderListing(uid) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const q = query(collection(db, "providers"), where("ownerId", "==", uid));
    const unsub = onSnapshot(q, (snap) => {
  if (snap.empty) {
    setListing(null);
  } else {
    const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
    const now  = new Date();
    setListing({
      ...data,
      isExpired: data.expiresAt ? data.expiresAt.toDate() < now : false,
    });
  }
  setLoading(false);
});
    return () => unsub();
  }, [uid]);

  return { listing, loading };
}


export async function toggleAvailability(providerId, current) {
  await updateDoc(doc(db, "providers", providerId), {
    available: !current,   
    updatedAt: serverTimestamp(),
  });
}

/** Edit any listing fields from the provider's settings page */
export async function updateProviderListing(providerId, fields) {
  await updateDoc(doc(db, "providers", providerId), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}