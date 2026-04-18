import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext({
  user: null,
  loading: true,   
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// ─── Helper: generate a URL-safe slug from any string ────────────────────────
export const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-"); // spaces → dashes

export const updatePortalSlug = async (uid, businessName) => {
  if (!uid || !businessName) return null;

  const newSlug = generateSlug(businessName);

  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    const oldSlug = userDoc.data()?.portalSlug;

    if (oldSlug === newSlug) return newSlug;

    const batch = writeBatch(db);

    if (oldSlug) {
      batch.delete(doc(db, "schoolSlugs", oldSlug));
    }

    batch.set(doc(db, "schoolSlugs", newSlug), {
      uid,
      businessName,
      updatedAt: serverTimestamp(),
    });

    batch.update(userDocRef, {
  portalSlug: newSlug,
});

    await batch.commit();
    console.log(`Portal slug updated: /parents/${newSlug}`);
    return newSlug;

  } catch (error) {
    console.error("Error updating portal slug:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [userDashboard, setUserDashboard] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setAuthUser(firebaseUser);

        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name,
            emailVerified: firebaseUser.emailVerified,
            dashboardId: userData.dashboardId,
            portalSlug: userData.portalSlug || " ", // ← expose slug to dashboard
          });

          setUserDashboard(userData.dashboardId);
          setIsAdmin(userData.isAdmin === true);
        }
      } else {
        setAuthUser(null);
        setUser(null);
        setUserDashboard(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (name, email, password, dashboardId, companyInfo) => {
    try {
      console.log("1. Creating user account...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log("User created:", user.uid);

      console.log("2. Sending verification email...");
      const actionCodeSettings = {
        url: "https://solidflo.co.za/verify-email",
        handleCodeInApp: true,
      };
      await sendEmailVerification(user, actionCodeSettings);
      console.log("Verification email sent");

      console.log("3. Skipping logo upload for now");

      console.log("4. Creating user document...");
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        dashboardId: dashboardId,
        createdAt: serverTimestamp(),
        emailVerified: false,
        role: "user",
        isAdmin: false,
        seeded: false,
        ...(dashboardId === 'education' && { portalSlug: null })
      });
      console.log("User document created");

      console.log("5. Creating collections...");
      const batch = writeBatch(db);

      const clientsRef = doc(db, "users", user.uid, "clients", "_init");
      batch.set(clientsRef, {
        _placeholder: true,
        createdAt: serverTimestamp(),
      });

      const invoicesRef = doc(db, "users", user.uid, "invoices", "_init");
      batch.set(invoicesRef, {
        _placeholder: true,
        createdAt: serverTimestamp(),
      });

      const paymentsRef = doc(db, "users", user.uid, "payments", "_init");
      batch.set(paymentsRef, {
        _placeholder: true,
        createdAt: serverTimestamp(),
      });

      const purchaseOrdersRef = doc(
        db,
        "users",
        user.uid,
        "purchaseOrders",
        "_init",
      );
      batch.set(purchaseOrdersRef, {
        _placeholder: true,
        createdAt: serverTimestamp(),
      });

      const quotationsRef = doc(db, "users", user.uid, "quotations", "_init");
      batch.set(quotationsRef, {
        _placeholder: true,
        createdAt: serverTimestamp(),
      });

      console.log("6. Adding business info...");
      const businessInfoData = {
        businessName: companyInfo?.companyName || "",
        addressLine1: companyInfo?.companyAddress || "",
        addressLine2: "",
        city: "",
        postalCode: "",
        primaryPhone: "",
        secondaryPhone: "",
        logoUrl: "",
        createdAt: serverTimestamp(),
      };

      const businessInfoRef = doc(
        db,
        "users",
        user.uid,
        "settings",
        "businessInfo",
      );
      batch.set(businessInfoRef, businessInfoData);

      // ── Education-only: init education subcollections ───────────────────
      if (dashboardId === "education") {
        console.log("6b. Creating education subcollections...");
        const educationCollections = [
          "students",
          "staff",
          "notices",
          "homework",
          "events",
          "timetable",
        ];
        educationCollections.forEach((colName) => {
          const ref = doc(db, "users", user.uid, colName, "_init");
          batch.set(ref, { _placeholder: true, createdAt: serverTimestamp() });
        });
  
      }
      // ───────────────────────────────────────────────────────────────────

       console.log("7. Seeding default template settings...");
      const templateSettingsRef = doc(
        db,
        "users",
        user.uid,
        "settings",
        "templateSettings",
      );
      batch.set(templateSettingsRef, {
        purchased:      ["professional"],
        activeTemplate: "professional",
        createdAt:      serverTimestamp(),
        updatedAt:      serverTimestamp(),
      });

      console.log("8. Committing batch...");
      await batch.commit();
      console.log("Batch committed successfully");

      console.log("9. Signing out...");
      await signOut(auth);
      console.log("Signed out successfully");

      return {
        success: true,
        message: `Account created successfully! Please check your email (${email}) to verify your account before logging in.`,
      };
    } catch (error) {
      console.error("Registration error:", error);

      let errorMessage = error.message;
      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please use a different email or try logging in.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      }

      return { success: false, message: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        return {
          success: false,
          message:
            "Please verify your email before logging in. Check your inbox for the verification link.",
        };
      }

      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      return {
        success: true,
        isAdmin: userData?.isAdmin === true,
        dashboardId: userData?.dashboardId,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      const resetSettings = {
        url: "https://solidflo.co.za/reset-password",
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, email, resetSettings);
      return {
        success: true,
        message: "Password reset email sent! Check your inbox.",
      };
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }
      return { success: false, message: errorMessage };
    }
  };

  const updateUserEmail = async (newEmail) => {
    try {
      if (!authUser) return { success: false, message: "No user logged in" };

      const changeSettings = {
        url: "https://solidflo.co.za/change-email",
        handleCodeInApp: true,
      };
      await verifyBeforeUpdateEmail(authUser, newEmail, changeSettings);
      return {
        success: true,
        message: "Verification email sent to your new email address!",
      };
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage =
          "Please log out and log back in before changing your email.";
      }
      return { success: false, message: errorMessage };
    }
  };
const refreshUser = async () => {
  if (!authUser) return;
  const userDoc = await getDoc(doc(db, "users", authUser.uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    setUser({
      uid: authUser.uid,
      email: authUser.email,
      name: userData.name,
      emailVerified: authUser.emailVerified,
      dashboardId: userData.dashboardId,
      portalSlug: userData.portalSlug || null,
    });
  }
};
  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
        userDashboard,
        isAdmin,
        login,
        register,
        logout,
        resetPassword,
        updateUserEmail,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
