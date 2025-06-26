// src/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { AppContext } from './App'; // AppContext is exported from App.jsx

// Import Firebase authentication functions from 'firebase/auth'
// Ensure you have these imported correctly if your firebase-config.js sets up auth there
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously
} from 'firebase/auth';


const LoginPage = ({ onLogin, auth }) => { // Accept 'auth' prop from App.jsx
    const { setMessage } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false); // To toggle between login/register UI
    const [loading, setLoading] = useState(false); // Manages loading state for UI disablement

    // --- DEBUGGING LOG ---
    // This will help us see if 'loading' is true unexpectedly
    console.log('LoginPage: Current loading state is:', loading);
    // --- END DEBUGGING LOG ---

    const handleAuth = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setLoginError(''); // Clear any previous errors
        setMessage(''); // Clear any previous messages
        setLoading(true); // Start loading state

        if (!auth) {
            setLoginError('Firebase Auth not initialized. Please refresh.');
            setLoading(true);
            return;
        }

        try {
            let userCredential;
            if (isRegistering) {
                // Use modular Firebase v9+ syntax: pass auth object as first argument
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                setMessage('Registration successful! Welcome!');
            } else {
                // Use modular Firebase v9+ syntax: pass auth object as first argument
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                setMessage('Login successful! Welcome back!');
            }
            onLogin(userCredential.user.uid); // Pass the user ID to the App component's onLogin handler
        } catch (error) {
            console.error('Authentication error:', error);
            // Firebase authentication errors often have a 'code' and 'message'
            let errorMessage = "An unexpected error occurred.";
            if (error.code) {
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address format.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This user account has been disabled.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'No user found with this email.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password.';
                        break;
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email is already registered.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password should be at least 6 characters.';
                        break;
                    default:
                        errorMessage = `Authentication failed: ${error.message}`;
                }
            } else {
                errorMessage = error.message;
            }
            setLoginError(errorMessage); // Display user-friendly error message
        } finally {
            setLoading(false); // End loading state, regardless of success or failure
        }
    };

    const handleGuestLogin = async () => {
        setLoginError('');
        setMessage('');
        setLoading(true);

        if (!auth) {
            setLoginError('Firebase Auth not initialized. Please refresh.');
            setLoading(false);
            return;
        }

        try {
            const userCredential = await signInAnonymously(auth);
            onLogin(userCredential.user.uid);
            setMessage('Welcome, Guest!');
        } catch (error) {
            console.error('Guest login error:', error);
            setLoginError(`Guest login failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md text-center border border-gray-700">
                <h1 className="text-4xl font-extrabold text-white mb-6">MindWell AI</h1>
                <p className="text-xl text-blue-400 mb-8 font-semibold">Login or Register</p>

                {loginError && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-6 shadow-md">
                        {loginError}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={loading} // Disabled when loading is true
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={loading} // Disabled when loading is true
                    />
                    <button
                        type="submit"
                        disabled={loading} // Disabled when loading is true
                        className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
                    </button>
                </form>

                <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    disabled={loading} // Disabled when loading is true
                    className="mt-4 w-full bg-transparent text-blue-300 font-semibold py-2 px-4 rounded-lg hover:underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register Now'}
                </button>

                <div className="my-6 text-center text-gray-400">OR</div>

                <button
                    onClick={handleGuestLogin}
                    disabled={loading} // Disabled when loading is true
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Entering as Guest...' : 'Enter as Guest'}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;