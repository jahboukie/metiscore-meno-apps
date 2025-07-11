import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { SecurityUtils } from "@metiscore/ui";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for SSR and SSG, prevent re-initialization on client
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize SecurityUtils with Firebase app for KMS operations
if (typeof window !== 'undefined') {
  SecurityUtils.setFirebaseApp(app);
}

// Export the initialized services
const auth = getAuth(app);
const db = getFirestore(app);
// Use default region for now (functions are deployed to us-central1)
const functions = getFunctions(app);

export { app, auth, db, functions };
