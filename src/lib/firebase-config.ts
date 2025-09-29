// Firebase configuration - hardcoded values as fallback for development
// This file should be updated with your actual Firebase project values

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC0GonvZHuq263cS5bLrcmT9fPQNUQp5po",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "acarreos-23764.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "acarreos-23764",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "acarreos-23764.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "327390470215",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:327390470215:web:27d5d8d579fee919831162",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ZKXSRPQB8E"
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is invalid');
}