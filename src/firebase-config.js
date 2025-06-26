// src/firebase-config.js
// This file centralizes your Firebase initialization.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from 'firebase/analytics'; // Uncomment if you need Firebase Analytics

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOIa4K-WRBMpzAyE6tV_AlRuzxYXZOgdo",
  authDomain: "mindwell-ai-companion.firebaseapp.com",
  projectId: "mindwell-ai-companion",
  storageBucket: "mindwell-ai-companion.firebasestorage.app",
  messagingSenderId: "927451801334",
  appId: "1:927451801334:web:81238398b1fb2acaf5aed7",
  measurementId: "G-G5KK15W64K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app); // Uncomment if you need Firebase Analytics

export { app, auth, db }; // Export the initialized instances