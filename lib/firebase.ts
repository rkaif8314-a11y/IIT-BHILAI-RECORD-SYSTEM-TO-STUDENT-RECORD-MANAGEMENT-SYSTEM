import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * ASRS Firebase web client.
 * These are Firebase Web App identifiers, not server credentials.
 * Keeping the configuration here makes the deployment independent of
 * Vercel/Netlify environment-variable configuration.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDb3YeW_zrtHnjydx8E4wd0gZdAWv7IXA4",
  authDomain: "asrs-1e171.firebaseapp.com",
  projectId: "asrs-1e171",
  storageBucket: "asrs-1e171.firebasestorage.app",
  messagingSenderId: "1037562093768",
  appId: "1:1037562093768:web:7f3b48701236a2bb7045fd",
  measurementId: "G-Q8YTC60G61",
};

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase client can only be initialized in the browser.");
  }

  const apps = getApps();
  return apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
