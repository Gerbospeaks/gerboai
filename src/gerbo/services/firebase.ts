import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * GerboAI runs on its own Firebase project (its Cloudflare worker verifies ID
 * tokens against that project), so it must NOT share SolidFlo's default app.
 * We register a *named* app ("gerbo") so both projects coexist in one bundle.
 * Override any value with REACT_APP_GERBO_FIREBASE_* env vars.
 */
const env = process.env;
const firebaseConfig = {
  apiKey: env.REACT_APP_GERBO_FIREBASE_API_KEY || "AIzaSyCLeSRilVxPblvu6cCfp1ZrIgERAzUJL7M",
  authDomain: env.REACT_APP_GERBO_FIREBASE_AUTH_DOMAIN || "gerbo-ai.firebaseapp.com",
  projectId: env.REACT_APP_GERBO_FIREBASE_PROJECT_ID || "gerbo-ai",
  storageBucket:
    env.REACT_APP_GERBO_FIREBASE_STORAGE_BUCKET || "gerbo-ai.firebasestorage.app",
  messagingSenderId:
    env.REACT_APP_GERBO_FIREBASE_MESSAGING_SENDER_ID || "402482078403",
  appId: env.REACT_APP_GERBO_FIREBASE_APP_ID || "1:402482078403:web:36cc9a697eaa40de873876",
};

const GERBO_APP_NAME = "gerbo";
const app = getApps().some((a) => a.name === GERBO_APP_NAME)
  ? getApp(GERBO_APP_NAME)
  : initializeApp(firebaseConfig, GERBO_APP_NAME);

export const db = getFirestore(app);
export const auth = getAuth(app);
