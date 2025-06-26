// src/main.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import EmergencyLoader from './EmergencyLoader'; // Make sure EmergencyLoader.jsx exists

// Import initialized Firebase instances from the centralized config file
import { auth, db } from './firebase-config';
// Removed signInAnonymously from here because we don't want to auto-sign in anonymously
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

// Import the AudioContextInitializer component (default export from AudioInit.jsx)
import AudioContextInitializer from './AudioInit';

const root = ReactDOM.createRoot(document.getElementById('root'));

// RootComponent will handle initial app loading and Firebase authentication state
function RootComponent() {
  const [appReady, setAppReady] = useState(false);
  const [userId, setUserId] = useState(null); // Firebase User ID
  const [firebaseMessage, setFirebaseMessage] = useState('');

  useEffect(() => {
    const initAuthAndApp = async () => {
      try {
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        // Set up the authentication state listener FIRST
        // This listener will be called immediately with the current user state (logged in or null)
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // A user is found (could be a previously persisted email/password user, or an auto-signed-in custom token user)
            setUserId(user.uid);
            setFirebaseMessage(`Authenticated: ${user.uid.substring(0, 8)}...`);
          } else {
            // No user is found (either never logged in, or logged out, or session expired)
            setUserId(null);
            setFirebaseMessage('Not authenticated.');
          }
          setAppReady(true); // App is ready once auth state is checked
        });

        // Handle custom token sign-in if present (for specific environments like Canvas)
        // This will attempt to log in using a provided token.
        // If it fails, we do NOT automatically sign in anonymously.
        if (initialAuthToken) {
          try {
            await signInWithCustomToken(auth, initialAuthToken);
            console.log('Signed in with custom token.');
          } catch (error) {
            console.error('Error signing in with custom token:', error);
            // If custom token fails, onAuthStateChanged will remain null,
            // and the app will correctly go to the login page via App.jsx's logic.
          }
        }
        // IMPORTANT: We have removed the unconditional signInAnonymously calls here.
        // If no user is found by onAuthStateChanged and no custom token is provided/valid,
        // then userId will correctly be null, and App.jsx will display the login page.

        // Clean up the listener when the component unmounts
        return () => unsubscribe();

      } catch (err) {
        console.error('Firebase initialization or authentication failed:', err);
        setFirebaseMessage(`Error: ${err.message}. Check console for details.`);
        setAppReady(true); // Ensure app is ready even on error to display message
      }
    };

    initAuthAndApp();
  }, []); // Run only once on mount

  if (!appReady) {
    return <EmergencyLoader message={firebaseMessage || "Initializing application and Firebase..."} />;
  }

  // Pass db, auth, and userId (which could be null now) to App
  return (
    <App
      db={db}
      auth={auth}
      initialUserId={userId} // This will be null if no user is authenticated
      firebaseMessage={firebaseMessage}
    />
  );
}

// Wrap the RootComponent with AudioContextInitializer at the main entry point
root.render(
  <React.StrictMode>
    <AudioContextInitializer>
      <RootComponent />
    </AudioContextInitializer>
  </React.StrictMode>
);