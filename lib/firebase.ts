import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Firebase web configuration.
// NEXT_PUBLIC_* environment variables can override these values in Vercel.
// Firebase Web API keys are intended to identify the web app; access is
// controlled by Firebase Authentication and Firestore Security Rules.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDb3YeW_zrtHnjydx8E4wd0gZdAWv7IXA4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "asrs-1e171.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "asrs-1e171",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "asrs-1e171.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1037562093768",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1037562093768:web:7f3b48701236a2bb7045fd",
};

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase client can only be initialized in the browser.");
  }

  const apps = getApps();
  return apps.length ? apps[0] : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
