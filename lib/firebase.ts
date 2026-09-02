import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * ASRS Firebase client.
 *
 * NEXT_PUBLIC_* values are used in deployed environments. The public web
 * configuration below is a safe fallback so the app can also prerender when
 * a hosting provider has not yet injected environment variables.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDb3YeW_zrtHnjydx8E4wd0gZdAWv7IXA4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "asrs-1e171.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "asrs-1e171",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "asrs-1e171.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1037562093768",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1037562093768:web:7f3b48701236a2bb7045fd",
};

export const firebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
