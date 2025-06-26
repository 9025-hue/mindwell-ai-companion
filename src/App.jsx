// src/App.jsx (Fixed Version)
import React, { useState, useEffect, createContext } from 'react';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import { AudioContextInitializer } from './AudioContextInitializer'; // Fixed import
import { signOut } from 'firebase/auth';

export const AppContext = createContext(null);

const App = ({ db, auth, initialUserId, firebaseMessage }) => {
    const [currentPage, setCurrentPage] = useState('login');
    const [userId, setUserId] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialUserId) {
            setUserId(initialUserId);
            setCurrentPage('dashboard');
            setMessage(firebaseMessage || 'Welcome!');
        }
        setLoading(false);
    }, [initialUserId, firebaseMessage]);

    const handleLogin = (id) => {
        setUserId(id);
        setCurrentPage('dashboard');
        setMessage('Welcome! Start your meditation.');
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            if (auth.currentUser && !auth.currentUser.isAnonymous) {
                await signOut(auth);
                setMessage('Logged out successfully.');
            } else {
                setMessage('Session ended.');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            setMessage(`Logout error: ${error.message}`);
        } finally {
            setUserId(null);
            setCurrentPage('login');
            setLoading(false);
        }
    };

    // Clear message after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-2xl">
                Loading MindWell AI...
            </div>
        );
    }

    return (
        <AudioContextInitializer>
            <AppContext.Provider value={{ userId, setUserId, message, setMessage, auth, db }}>
                <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 via-purple-900 to-indigo-900 text-white font-inter relative overflow-hidden">
                    {/* Animated background blobs */}
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
                    <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-700 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-fuchsia-700 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>

                    {/* Message display */}
                    {message && (
                        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 p-4 bg-blue-600 text-white rounded-xl shadow-2xl z-50 animate-slideInDown transition-all duration-300 max-w-md text-center">
                            {message}
                        </div>
                    )}

                    {/* Page routing */}
                    {currentPage === 'login' && <LoginPage onLogin={handleLogin} auth={auth} />}
                    {currentPage === 'dashboard' && <DashboardPage onLogout={handleLogout} />}
                </div>
            </AppContext.Provider>
        </AudioContextInitializer>
    );
};

export default App;