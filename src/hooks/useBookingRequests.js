// src/hooks/useBookingRequests.js
// Handles all booking request reads and writes.
// Booking requests collection: bookingRequests/{auto-id}

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ── Read hooks ────────────────────────────────────────────────

/**
 * useIncomingRequests(providerId)
 * Replaces hardcoded INITIAL_INCOMING in ServiceMarketplace.jsx (IncomingView).
 * Subscribes to all requests sent TO this provider.
 */
export function useIncomingRequests(providerId) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!providerId) return;

    const q = query(
      collection(db, "bookingRequests"),
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setRequests(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          receivedAt: d.data().createdAt
            ? relativeTime(d.data().createdAt.toDate())
            : "Just now",
        })),
      );
      setLoading(false);
    });

    return () => unsub();
  }, [providerId]);

  return { requests, loading };
}

/**
 * useMyRequests(uid)
 * Replaces INITIAL_MY_REQS in MarketView.
 * Subscribes to all requests sent BY this client/user.
 */
export function useMyRequests(uid) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "bookingRequests"),
      where("clientId", "==", uid),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  return { requests, loading };
}

// ── Write functions ───────────────────────────────────────────

/**
 * sendBookingRequest(formData, provider, user)
 *
 * Called when the client submits the BookingPanel form.
 * user comes from your useAuth() hook → { uid, name, email }
 */
export async function sendBookingRequest(formData, provider, user) {
  const ref = await addDoc(collection(db, "bookingRequests"), {
    // Parties
    providerId:       provider.id,
    providerName:     provider.name,
    providerIndustry: provider.industry,
    clientId:         user.uid,
    clientName:       user.name || user.email,

    // Job details from the form
    service:      formData.desc,
    address:      formData.address,
    date:         formData.date,
    time:         formData.time,
    urgency:      formData.urgency,
    attachedDoc:  formData.doc || "None",

    // State machine
    status:       "new",        // new → quoted → accepted | declined
    quoteAmount:  null,
    quoteNotes:   null,

    createdAt:    serverTimestamp(),
    updatedAt:    serverTimestamp(),
  });
  return ref.id;
}

/**
 * sendQuote(requestId, amount, notes)
 * Provider sends a quote back to the client.
 */
export async function sendQuote(requestId, amount, notes = "") {
  await updateDoc(doc(db, "bookingRequests", requestId), {
    status:      "quoted",
    quoteAmount: amount,
    quoteNotes:  notes,
    updatedAt:   serverTimestamp(),
  });
}

/**
 * acceptRequest(requestId)
 * Provider accepts the job.
 */
export async function acceptRequest(requestId) {
  await updateDoc(doc(db, "bookingRequests", requestId), {
    status:    "accepted",
    updatedAt: serverTimestamp(),
  });
}

/**
 * declineRequest(requestId)
 * Provider declines the job.
 */
export async function declineRequest(requestId) {
  await updateDoc(doc(db, "bookingRequests", requestId), {
    status:    "declined",
    updatedAt: serverTimestamp(),
  });
}

// ── Helper ────────────────────────────────────────────────────

function relativeTime(date) {
  const diff    = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  if (minutes < 2)   return "Just now";
  if (minutes < 60)  return `${minutes} min ago`;
  if (hours   < 24)  return `${hours}h ago`;
  if (days    === 1) return "Yesterday";
  return `${days} days ago`;
}