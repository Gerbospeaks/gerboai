// src/hooks/useProviderListing.js
//
// Call createProviderListing() right after your existing register() succeeds.
// This writes the provider's marketplace card to Firestore.
//
// Your existing AuthContext.register() already creates:
//   users/{uid}  ← user profile
//   users/{uid}/settings/businessInfo  ← business name, address, logo
//
// This adds:
//   providers/{auto-id}  ← the public marketplace listing

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * createProviderListing(uid, businessInfo)
 *
 * Call this once after your register() succeeds, before signOut().
 * businessInfo comes from the companyInfo object you already collect.
 *
 * @param {string} uid            - Firebase Auth UID
 * @param {object} businessInfo   - { companyName, industry, location, rate, about, phone }
 */
export async function createProviderListing(uid, businessInfo) {
  // Guard: don't create a duplicate if they somehow register twice
  const existing = await getDocs(
    query(collection(db, "providers"), where("ownerId", "==", uid)),
  );
  if (!existing.empty) return existing.docs[0].id;

  // Derive avatar initials from business name
  const initials = (businessInfo.companyName || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  // Pick a neutral avatar colour from a preset palette
  const palettes = [
    { bg: "#eef2ff", tc: "#4338ca" },
    { bg: "#ecfdf5", tc: "#065f46" },
    { bg: "#fff7ed", tc: "#9a3412" },
    { bg: "#f0f9ff", tc: "#0369a1" },
    { bg: "#fdf4ff", tc: "#6b21a8" },
    { bg: "#fefce8", tc: "#854d0e" },
  ];
  const palette = palettes[Math.floor(Math.random() * palettes.length)];

  const ref = await addDoc(collection(db, "providers"), {
    ownerId:   uid,
    name:      businessInfo.companyName    || "",
    industry:  businessInfo.industry       || "",   // matches INDUSTRIES id
    loc:       businessInfo.location       || "",
    rate:      businessInfo.rate           || "Get a quote",
    about:     businessInfo.about          || "",
    phone:     businessInfo.phone          || null,
    initials,
    bg:        palette.bg,
    tc:        palette.tc,
    logoUrl:   null,                // set later from settings page

    // Defaults
    avail:     true,
    featured:  false,               // true on paid plan only
    rating:    0,
    reviews:   0,
    response:  "~1 hr",
    badges:    [],                  // provider adds from their settings

    active:    true,
    plan:      "free",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;  // the Firestore document ID for this listing
}