import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDashboard, setUserDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name,
            emailVerified: firebaseUser.emailVerified
          });
          setUserDashboard(userData.dashboardId);
        }
      } else {
        setUser(null);
        setUserDashboard(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

 const register = async (name, email, password, dashboardId, companyInfo) => {
  try {
    console.log('1. Creating user account...');
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log('User created:', user.uid);

    console.log('2. Sending verification email...');
    await user.sendEmailVerification();
    console.log('Verification email sent');

    // TEMPORARILY SKIP LOGO UPLOAD
    //let logoUrl = '';
    console.log('3. Skipping logo upload for now');

    console.log('4. Creating user document...');
    await db.collection('users').doc(user.uid).set({
      name: name,
      email: email,
      dashboardId: dashboardId,
      createdAt: new Date(),
      emailVerified: false,
      role: 'user'
    });
    console.log('User document created');

    console.log('5. Creating collections...');
    const batch = db.batch();

    // Initialize collections
    const clientsRef = db.collection('users').doc(user.uid).collection('clients').doc('_init');
    batch.set(clientsRef, { _placeholder: true, createdAt: new Date() });

    const invoicesRef = db.collection('users').doc(user.uid).collection('invoices').doc('_init');
    batch.set(invoicesRef, { _placeholder: true, createdAt: new Date() });

    const paymentsRef = db.collection('users').doc(user.uid).collection('payments').doc('_init');
    batch.set(paymentsRef, { _placeholder: true, createdAt: new Date() });

    const purchaseOrdersRef = db.collection('users').doc(user.uid).collection('purchaseOrders').doc('_init');
    batch.set(purchaseOrdersRef, { _placeholder: true, createdAt: new Date() });

    const quotationsRef = db.collection('users').doc(user.uid).collection('quotations').doc('_init');
    batch.set(quotationsRef, { _placeholder: true, createdAt: new Date() });

    // Add business info to settings subcollection
    console.log('6. Adding business info...');
    const businessInfoData = {
      businessName: companyInfo?.companyName || '',
      addressLine1: companyInfo?.companyAddress || '',
      addressLine2: '',
      city: '',
      postalCode: '',
      primaryPhone: '',
      secondaryPhone: '',
      logoUrl: '', // Empty for now
      createdAt: new Date()
    };
    console.log('Business info data:', businessInfoData);
    
    const businessInfoRef = db.collection('users').doc(user.uid).collection('settings').doc('businessInfo');
    batch.set(businessInfoRef, businessInfoData);

    console.log('7. Committing batch...');
    await batch.commit();
    console.log('Batch committed successfully');

    console.log('8. Signing out...');
    await auth.signOut();
    console.log('Signed out successfully');

    return { 
      success: true, 
      message: `Account created successfully! Please check your email (${email}) to verify your account before logging in. You can upload your logo later in settings.`
    };
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please use a different email or try logging in.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.';
    }
    
    return { success: false, message: errorMessage };
  }
};

  const login = async (email, password) => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        return { 
          success: false, 
          message: 'Please verify your email before logging in. Check your inbox for the verification link.' 
        };
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, userDashboard, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};