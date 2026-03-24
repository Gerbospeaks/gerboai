import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { buildGradeThemes } from "./gradeThemes";

export async function loadPaletteSelections(userId) {
  const ref = doc(db, "users", userId, "settings", "themes");
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().paletteSelections ?? {}) : {};
}

export async function savePaletteSelections(userId, selections) {
  const ref = doc(db, "users", userId, "settings", "themes");
  await setDoc(ref, { paletteSelections: selections }, { merge: true });
}