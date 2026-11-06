import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../services/firebase"; // ← GerboAI Firebase app (see services/firebase.ts)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GerboUser {
  uid: string;
  email: string | null;
  name: string;
  displayName: string; // mirrors Firebase User.displayName for Dashboard compat
  emailVerified: boolean;
  dashboardId: string | null;
  gerboAiUser: boolean;
  role: string;
  isAdmin: boolean;
  permissions: string[];
}

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: GerboUser | null;
  authUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  /** Returns AuthResult. Access uid/email via the user state, not the return value. */
  signUp: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updateUserEmail: (newEmail: string) => Promise<AuthResult>;
  refreshUser: () => Promise<void>;
  /** Proxy for Firebase's user.getIdToken() — use wherever Dashboard calls getIdToken() */
  getIdToken: () => Promise<string>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  authUser: null,
  isAdmin: false,
  loading: true,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  updateUserEmail: async () => ({ success: false }),
  refreshUser: async () => {},
  getIdToken: async () => {
    throw new Error("Not implemented");
  },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<GerboUser | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setAuthUser(firebaseUser);
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: data.name || "",
              displayName: data.name || firebaseUser.email || "User",
              emailVerified: firebaseUser.emailVerified,
              dashboardId: data.dashboardId || null,
              gerboAiUser: data.gerboAiUser === true,
              role: data.role || "user",
              isAdmin: data.isAdmin === true,
              permissions: data.permissions || [],
            });
            setIsAdmin(data.isAdmin === true);
          }
        } else {
          setAuthUser(null);
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth state error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ── Sign Up ──────────────────────────────────────────────────────────────
  // Mirrors GerboAI's register() so the shared Firestore schema stays intact.
  const signUp = async (
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResult> => {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const { user: firebaseUser } = credential;

      // Send verification email (same redirect as GerboAI pattern)
      await sendEmailVerification(firebaseUser, {
        url: "https://gerboai.com/verify-email", // ← update to your domain
        handleCodeInApp: true,
      });

      const batch = writeBatch(db);

      // ── users/{uid} root doc ──────────────────────────────────────────────
      batch.set(doc(db, "users", firebaseUser.uid), {
        name: name || email.split("@")[0],
        email,
        dashboardId: null, // no industry dashboard for GerboAI users
        gerboAiUser: true, // distinguishes origin from GerboAI signups
        createdAt: serverTimestamp(),
        emailVerified: false,
        role: "user",
        isAdmin: false,
        seeded: false,
      });

      // ── Subcollections GerboAI expects ──────────────────────────────────
      // Required so that if a user later links a GerboAI dashboard the
      // collections already exist and invoice/quote creation won't fail.
      const subcollections = [
        "clients",
        "invoices",
        "payments",
        "purchaseOrders",
        "quotations",
      ];
      subcollections.forEach((col) => {
        batch.set(doc(db, "users", firebaseUser.uid, col, "_init"), {
          _placeholder: true,
          createdAt: serverTimestamp(),
        });
      });

      // ── settings/businessInfo ─────────────────────────────────────────────
      // Empty shell so GerboAI invoice templates don't crash on missing doc.
      batch.set(
        doc(db, "users", firebaseUser.uid, "settings", "businessInfo"),
        {
          businessName: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          postalCode: "",
          primaryPhone: "",
          secondaryPhone: "",
          logoUrl: "",
          createdAt: serverTimestamp(),
        },
      );

      // ── settings/templateSettings ─────────────────────────────────────────
      batch.set(
        doc(db, "users", firebaseUser.uid, "settings", "templateSettings"),
        {
          purchased: ["professional"],
          activeTemplate: "professional",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      );
batch.set(
  doc(db, "users", firebaseUser.uid, "settings", "agentSettings"),
  {
    agentName: "",
    greetingMessage: "",
    systemInstructions: "",
    language: "en-US",
    voiceId: "default",
    forwardToNumber: "",
    phoneNumber: "",
    twilioNumber: "",
    vapiAssistantId: "",
    vapiPhoneNumberId: "",
    provisionedAt: null,       // set when number is provisioned
    updatedAt: serverTimestamp(),
    deletedAt: null,
  }
);
      await batch.commit();

      // Sign out immediately — require email verification before first login
      await firebaseSignOut(auth);

      return {
        success: true,
        message: `Account created! Please verify your email (${email}) before logging in.`,
      };
    } catch (error: any) {
      const map: Record<string, string> = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Invalid email address.",
        "auth/weak-password":
          "Password is too weak. Use at least 6 characters.",
      };
      return { success: false, message: map[error.code] ?? error.message };
    }
  };

  // ── Sign In ──────────────────────────────────────────────────────────────
  const signIn = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const userDoc = await getDoc(doc(db, "users", credential.user.uid));
      const data = userDoc.data();

      // GerboAI users must also verify their email
      if (!credential.user.emailVerified) {
        await firebaseSignOut(auth);
        return {
          success: false,
          message: "Please verify your email before logging in.",
        };
      }

      // Keep Firestore emailVerified flag in sync
      if (data && !data.emailVerified) {
        await setDoc(
          doc(db, "users", credential.user.uid),
          { emailVerified: true },
          
          { merge: true },
        );
      }

      return {
        success: true,
        isAdmin: data?.isAdmin === true,
        dashboardId: data?.dashboardId ?? null,
      } as AuthResult & { isAdmin: boolean; dashboardId: string | null };
    } catch (error: any) {
      const map: Record<string, string> = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
      };
      return { success: false, message: map[error.code] ?? error.message };
    }
  };

  // ── Sign Out ─────────────────────────────────────────────────────────────
  const signOut = async (): Promise<AuthResult> => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  // ── Password Reset ───────────────────────────────────────────────────────
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: "https://gerboai.com/reset-password", // ← update to your domain
        handleCodeInApp: true,
      });
      return {
        success: true,
        message: "Password reset email sent! Check your inbox.",
      };
    } catch (error: any) {
      const map: Record<string, string> = {
        "auth/user-not-found": "No account found with this email.",
        "auth/invalid-email": "Invalid email address.",
      };
      return { success: false, message: map[error.code] ?? error.message };
    }
  };

  // ── Update Email ─────────────────────────────────────────────────────────
  const updateUserEmail = async (newEmail: string): Promise<AuthResult> => {
    try {
      if (!authUser) return { success: false, message: "No user logged in." };
      await verifyBeforeUpdateEmail(authUser, newEmail, {
        url: "https://gerboai.com/change-email", // ← update to your domain
        handleCodeInApp: true,
      });
      return {
        success: true,
        message: "Verification sent to your new email address!",
      };
    } catch (error: any) {
      const map: Record<string, string> = {
        "auth/email-already-in-use": "This email is already in use.",
        "auth/invalid-email": "Invalid email address.",
        "auth/requires-recent-login":
          "Please log out and back in before changing your email.",
      };
      return { success: false, message: map[error.code] ?? error.message };
    }
  };

  // ── getIdToken ────────────────────────────────────────────────────────────
  // Proxies Firebase's getIdToken so Dashboard doesn't need to import authUser
  // directly. All existing user.getIdToken() calls become getIdToken() instead.
  const getIdToken = async (): Promise<string> => {
    if (!authUser) throw new Error("No authenticated user");
    return authUser.getIdToken();
  };

  // ── Refresh User ─────────────────────────────────────────────────────────
  // Call this after updating Firestore so in-memory state stays in sync.
  const refreshUser = async (): Promise<void> => {
    if (!authUser) return;
    const userDoc = await getDoc(doc(db, "users", authUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setUser({
        uid: authUser.uid,
        email: authUser.email,
        name: data.name || "",
        displayName: data.name || authUser.email || "User",
        emailVerified: authUser.emailVerified,
        dashboardId: data.dashboardId || null,
        gerboAiUser: data.gerboAiUser === true,
        role: data.role || "user",
        isAdmin: data.isAdmin === true,
        permissions: data.permissions || [],
      });
      setIsAdmin(data.isAdmin === true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateUserEmail,
        refreshUser,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
