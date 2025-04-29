"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  Auth,
  User
} from "firebase/auth";
import { setCookie, deleteCookie } from 'cookies-next';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

// Check if Firebase is properly configured
const isConfigValid = () => {
  return (
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== 'AIzaSyDOCAbC123dEf456GhI789jKl01-MnO' && 
    firebaseConfig.authDomain && 
    firebaseConfig.authDomain !== 'your-app.firebaseapp.com'
  );
};

// Only initialize Firebase if the configuration is valid and we're in a browser context
if (typeof window !== 'undefined') {
  try {
    if (isConfigValid()) {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
    } else {
      console.warn('Firebase is not properly configured. Authentication will not work.');
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  isConfigured: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  error: null,
  isConfigured: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = isConfigValid();

  // Handle setting authentication cookies for middleware
  const handleAuthChange = (user: User | null) => {
    setUser(user);
    setLoading(false);

    if (user) {
      // Get the authentication token
      user.getIdToken().then(token => {
        // Set the token in a cookie for the middleware
        setCookie('firebase-auth-token', token, {
          // Cookie will expire in 2 weeks
          maxAge: 60 * 60 * 24 * 14,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      });
    } else {
      // Remove the cookie on sign out
      deleteCookie('firebase-auth-token');
    }
  };

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      handleAuthChange(user);
    });

    return unsubscribe;
  }, [isConfigured]);

  const signInWithGoogle = async () => {
    if (!isConfigured || !auth || !googleProvider) {
      setError('Firebase is not properly configured');
      return;
    }

    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setError((error as Error).message);
      console.error("Google sign-in error:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured || !auth) {
      setError('Firebase is not properly configured');
      return;
    }

    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError((error as Error).message);
      console.error("Sign-in error:", error);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isConfigured || !auth) {
      setError('Firebase is not properly configured');
      return;
    }

    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError((error as Error).message);
      console.error("Sign-up error:", error);
    }
  };

  const signOut = async () => {
    if (!isConfigured || !auth) {
      return;
    }

    try {
      await firebaseSignOut(auth);
      // Remove the auth cookie
      deleteCookie('firebase-auth-token');
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signIn,
        signUp,
        signOut,
        error,
        isConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 