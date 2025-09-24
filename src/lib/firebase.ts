
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// =================================================================================
// TODO: REPLACE WITH YOUR FIREBASE PROJECT CONFIGURATION
// =================================================================================
// Go to your Firebase project console, click on "Project settings",
// then in the "General" tab, scroll down to "Your apps".
// Click on the "Web" app (</>) icon and copy the firebaseConfig object.
const firebaseConfig = {
  apiKey: "AIzaSyC0GonvZHuq263cS5bLrcmT9fPQNUQp5po",
  authDomain: "acarreos-23764.firebaseapp.com",
  projectId: "acarreos-23764",
  storageBucket: "acarreos-23764.firebasestorage.app",
  messagingSenderId: "327390470215",
  appId: "1:327390470215:web:27d5d8d579fee919831162",
  measurementId: "G-ZKXSRPQB8E"
};
// =================================================================================

// Initialize Firebase safely for both client and server-side rendering in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
