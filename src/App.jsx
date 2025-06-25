import React, { useState, useEffect, createContext, useContext, useRef } from 'react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth'; // Import all auth functions as a namespace

// AppContext to manage global state like user ID, Firebase instances, and messages
const AppContext = createContext(null);

// Main App Component
const App = () => {
    // Firebase states
    const [firebaseApp, setFirebaseApp] = useState(null);
    const [auth, setAuth] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false); // Indicates if Firebase Auth is initialized and user state is known

    // App UI states
    const [currentPage, setCurrentPage] = useState('login');
    const [userId, setUserId] = useState(null); // Firebase UID will be stored here
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true); // Initial app loading

    // Firebase Initialization and Authentication Listener
    useEffect(() => {
        const initFirebase = async () => {
            try {
                // Firebase config is expected to be a global variable from the Canvas environment
                const firebaseConfig = typeof __firebase_config !== 'undefined' 
                                       ? JSON.parse(__firebase_config) 
                                       : null;

                if (!firebaseConfig || !firebaseConfig.apiKey) {
                    console.error("Firebase config not found or invalid. Please ensure __firebase_config is correctly provided.");
                    setMessage("Firebase not configured. AI features will not work.");
                    // Proceed without Firebase auth if config is missing, but features will be limited
                    setLoading(false);
                    setIsAuthReady(true);
                    return;
                }

                const app = initializeApp(firebaseConfig);
                const currentAuth = FirebaseAuth.getAuth(app); // Use FirebaseAuth.getAuth

                setFirebaseApp(app);
                setAuth(currentAuth);

                // Listen for authentication state changes
                const unsubscribe = FirebaseAuth.onAuthStateChanged(currentAuth, async (user) => { // Use FirebaseAuth.onAuthStateChanged
                    if (user) {
                        setUserId(user.uid);
                        setCurrentPage('dashboard');
                        setMessage(`Signed in as: ${user.email || user.uid}`);
                    } else {
                        setUserId(null);
                        setCurrentPage('login');
                        setMessage('Please sign in or use a magic link.');
                        // Attempt anonymous sign-in if no user and no initial token (for Canvas)
                        if (typeof __initial_auth_token === 'undefined') {
                            try {
                                await FirebaseAuth.signInAnonymously(currentAuth); // Use FirebaseAuth.signInAnonymously
                                // Anonymous user handled by onAuthStateChanged if successful
                            } catch (anonError) {
                                console.error("Anonymous sign-in failed:", anonError);
                                setMessage("Could not sign in anonymously. Functionality may be limited.");
                            }
                        }
                    }
                    setIsAuthReady(true); // Auth state is now known
                    setLoading(false); // App is ready after auth check
                });

                // Handle initial custom token sign-in for Canvas if available
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    try {
                        // Ensure signInWithCustomToken is available before calling
                        if (typeof FirebaseAuth.signInWithCustomToken === 'function') {
                            await FirebaseAuth.signInWithCustomToken(currentAuth, __initial_auth_token); // Use FirebaseAuth.signInWithCustomToken
                            setMessage("Signed in with initial token.");
                        } else {
                            console.warn("FirebaseAuth.signInWithCustomToken is not available in this environment.");
                            setMessage("Custom token sign-in skipped: Function not available.");
                            // Fallback to anonymous if custom token is intended but function is missing
                            await FirebaseAuth.signInAnonymously(currentAuth);
                        }
                    } catch (tokenError) {
                        console.error("Custom token sign-in failed:", tokenError);
                        setMessage("Initial token sign-in failed. Please try again.");
                    }
                }

                return () => unsubscribe(); // Cleanup auth listener on unmount
            } catch (error) {
                console.error("Error initializing Firebase:", error);
                setMessage(`Error initializing app: ${error.message}`);
                setLoading(false);
                setIsAuthReady(true);
            }
        };

        initFirebase();
    }, []); // Empty dependency array means this runs once on mount

    if (loading || !isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
                <div className="text-xl animate-pulse">Loading MindWell AI...</div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={{ userId, setUserId, setMessage, auth, firebaseApp }}>
            <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 via-purple-900 to-indigo-900 text-white font-inter relative overflow-hidden">
                {/* Background circles for aesthetic appeal */}
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-700 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-fuchsia-700 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>


                {message && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 p-4 bg-blue-600 text-white rounded-xl shadow-2xl z-50 animate-slideInDown transition-all duration-300">
                        {message}
                    </div>
                )}
                {currentPage === 'login' && <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} />}
                {currentPage === 'dashboard' && <DashboardPage />}
            </div>
        </AppContext.Provider>
    );
};

// Login Page Component
const LoginPage = ({ onLoginSuccess }) => {
    const { setUserId, setMessage, auth } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);

    // Effect to handle sign-in from email link
    useEffect(() => {
        if (!auth) return; // Ensure auth object is available

        // Check if the current URL is a sign-in with email link
        if (FirebaseAuth.isSignInWithEmailLink(auth, window.location.href)) { // Use FirebaseAuth.isSignInWithEmailLink
            let userEmail = localStorage.getItem('emailForSignIn');
            if (!userEmail) {
                // User opened the link on a different device or browser.
                // Prompt them to enter their email.
                userEmail = window.prompt('Please provide your email for confirmation:');
                if (!userEmail) {
                    setMessage('Email not provided. Sign-in cancelled.');
                    return;
                }
            }
            setLoading(true);
            FirebaseAuth.signInWithEmailLink(auth, userEmail, window.location.href) // Use FirebaseAuth.signInWithEmailLink
                .then((result) => {
                    localStorage.removeItem('emailForSignIn'); // Clean up email
                    setUserId(result.user.uid);
                    setMessage(`Successfully signed in as ${result.user.email}`);
                    onLoginSuccess();
                })
                .catch((error) => {
                    console.error("Error signing in with email link:", error);
                    setMessage(`Email link sign-in failed: ${error.message}`);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [auth, onLoginSuccess, setUserId, setMessage]); // Depend on auth, onLoginSuccess, etc.


    const handleSendSignInLink = async () => {
        if (!email.trim()) {
            setMessage('Please enter your email address.');
            return;
        }

        setLoading(true);
        setMessage('Sending magic link...');

        // Configuration for the email link
        const actionCodeSettings = {
            url: window.location.href, // This URL should be your app's deployed URL (e.g., https://your-netlify-app.netlify.app/)
                                      // Firebase Console's "Authorized domains" must include this.
            handleCodeInApp: true, // This must be true for mobile apps, useful for web too
        };

        try {
            await FirebaseAuth.sendSignInLinkToEmail(auth, email, actionCodeSettings); // Use FirebaseAuth.sendSignInLinkToEmail
            localStorage.setItem('emailForSignIn', email); // Save email for later retrieval after redirect
            setEmailSent(true);
            setMessage(`A magic link has been sent to ${email}. Please check your inbox (and spam folder!).`);
        } catch (error) {
            console.error("Error sending sign-in link:", error);
            setMessage(`Failed to send link: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
            <div className="bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-3xl shadow-3xl p-8 md:p-14 w-full max-w-md border border-purple-500 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-purple-glow">
                <h1 className="text-5xl font-extrabold text-center text-white mb-6 tracking-wide drop-shadow-lg">
                    MindWell AI
                </h1>
                <p className="text-white text-center mb-10 text-lg opacity-90 leading-relaxed">
                    Your personal AI companion for mental wellness.
                    Sign in to continue your journey.
                </p>

                {!emailSent ? (
                    <div className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-transparent focus:border-purple-500 transition-colors duration-300 text-lg"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSendSignInLink}
                            disabled={loading || !email.trim()}
                            className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:from-purple-800 hover:to-indigo-800 transition-all duration-400 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed text-xl tracking-wide"
                        >
                            {loading ? 'Sending...' : 'Send Magic Link'}
                        </button>
                    </div>
                ) : (
                    <p className="text-green-300 text-center text-xl mt-4 animate-fadeIn">
                        Link sent! Check your email to sign in.
                    </p>
                )}
                <p className="text-gray-300 text-sm text-center mt-8 opacity-80">
                    A secure, passwordless sign-in link will be sent to your email.
                </p>
            </div>
        </div>
    );
};

// Dashboard Page Component
const DashboardPage = () => {
    const { userId, setMessage, auth } = useContext(AppContext);

    const handleLogout = async () => {
        try {
            await FirebaseAuth.signOut(auth); // Use FirebaseAuth.signOut
            setMessage('Successfully logged out.');
            // onAuthStateChanged listener in App component will handle changing currentPage to 'login'
        } catch (error) {
            console.error("Error logging out:", error);
            setMessage(`Logout failed: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-6 relative z-10">
            <header className="w-full max-w-5xl text-center py-8">
                <h1 className="text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg animate-fadeInDown">
                    MindWell AI Dashboard
                </h1>
                {userId && <p className="text-gray-300 mt-4 text-xl opacity-90 animate-fadeInUp">Welcome, <span className="font-bold text-purple-300">{userId}</span>!</p>}
                {userId && auth && auth.currentUser && !auth.currentUser.isAnonymous && (
                    <button
                        onClick={handleLogout}
                        className="mt-6 bg-red-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75 flex items-center justify-center mx-auto text-base"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"></path></svg>
                        Logout
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mt-12">
                {/* Chatbot Section */}
                <Card title="Chat with AI" description="Get supportive responses and empathetic advice.">
                    <Chatbot />
                </Card>

                {/* Journal Entry Section */}
                <Card title="Voice Journal" description="Record your thoughts with intuitive speech-to-text.">
                    <JournalEntry />
                </Card>

                {/* Image Generation Section */}
                <Card title="Inspiring Images" description="Generate calming and uplifting visuals from your prompts.">
                    <ImageGenerator />
                </Card>

                {/* New Meditation Section */}
                <Card title="Meditation Space" description="Find calm and focus through guided practices and timers." large={true}>
                    <MeditationSection />
                </Card>

                {/* Support Section */}
                <Card title="User Support & Resources" description="Find answers to FAQs and essential external support." large={true}>
                    <SupportSection />
                </Card>
            </div>
        </div>
    );
};

// Reusable Card Component for Dashboard Sections
const Card = ({ title, description, children, large }) => {
    return (
        <div className={`bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl rounded-3xl shadow-3xl p-7 border border-gray-700 hover:border-purple-600 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-purple-glow flex flex-col ${large ? 'md:col-span-2' : ''}`}>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-wide drop-shadow-md">{title}</h2>
            <p className="text-gray-300 mb-6 text-lg opacity-90">{description}</p>
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
};


// Language options for Speech Recognition
const languageOptions = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'en-ZA', name: 'English (South Africa)' },
    { code: 'af-ZA', name: 'Afrikaans (South Africa)' },
    { code: 'zu-ZA', name: 'isiZulu (South Africa)' },
    { code: 'xh-ZA', name: 'isiXhosa (South Africa)' },
    { code: 'st-ZA', name: 'Sesotho (South Africa)' },
    { code: 'tn-ZA', name: 'Setswana (South Africa)' },
    { code: 'nso-ZA', name: 'Sepedi (South Africa)' },
    { code: 'ts-ZA', name: 'Xitsonga (South Africa)' },
    { code: 've-ZA', name: 'Tshivenda (South Africa)' },
    { code: 'nr-ZA', name: 'isiNdebele (South Africa)' },
    { code: 'ss-ZA', name: 'SiSwati (South Africa)' },
    { code: 'fr-FR', name: 'French' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'de-DE', name: 'German' },
];

// Chatbot Component
const Chatbot = () => {
    const { setMessage } = useContext(AppContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null); // Ref for scrolling to the latest message

    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null); // Ref to hold the SpeechRecognition object
    const mediaStreamRef = useRef(null); // Ref to hold the media stream to stop it later
    const [selectedLanguage, setSelectedLanguage] = useState('en-ZA'); // Default to English (South Africa)

    // Scroll to bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Speech Recognition setup for Chat
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            // setMessage('Speech Recognition API not supported by this browser for chat voice input.');
            return; // Don't set message repeatedly, only once for journal
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true; // Continuous for chat input
        recognition.interimResults = true; // Show interim results
        recognition.lang = selectedLanguage;

        recognition.onstart = () => {
            setIsRecording(true);
            setMessage('Chat recording started...');
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            // Update input field with either final or interim, prioritizing final
            setInput(finalTranscript || interimTranscript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error in chat:", event.error);
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                setMessage('Microphone access denied. Please enable microphone permissions in your browser settings.');
            } else {
                setMessage(`Chat voice input error: ${event.error}`);
            }
            setIsRecording(false);
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
            setMessage('Chat recording ended.');
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current && isRecording) {
                recognitionRef.current.stop();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
        };
    }, [selectedLanguage]); // Re-run effect if language changes

    const toggleVoiceInput = async () => {
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setInput(''); // Clear input before starting new recording
            setMessage('Requesting microphone access for chat...');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;
                setMessage('Microphone access granted. Start speaking for chat input...');
                recognitionRef.current.start();
            } catch (err) {
                console.error("Error accessing microphone for chat:", err);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setMessage('Microphone access denied. Please enable microphone permissions in your browser settings.');
                } else {
                    setMessage(`Failed to access microphone for chat: ${err.message}`);
                }
                setIsRecording(false);
            }
        }
    };


    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", text: input, timestamp: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setMessage('');

        // Stop recording if active when sending message
        if (isRecording) {
            recognitionRef.current.stop();
        }

        try {
            let chatHistory = messages.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
            chatHistory.push({ role: "user", parts: [{ text: userMessage.text }] }); // Use userMessage.text as input might be cleared

            const payload = { contents: chatHistory };
            const apiKey = "AIzaSyBxWYwq0x4t2QHaZqxy2nnW6mQD8y--wxI"; // Canvas will provide this in runtime for gemini-2.0-flash
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const botResponseText = result.candidates[0].content.parts[0].text;
                setMessages(prev => [...prev, { role: "bot", text: botResponseText, timestamp: new Date().toLocaleTimeString() }]);
            } else {
                setMessage("AI response was empty or malformed.");
            }
        } catch (error) {
            console.error("Error sending message to AI:", error);
            setMessage(`Failed to get AI response: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-2xl shadow-inner-xl border border-gray-700">
            <div className="p-4 bg-gray-800 rounded-t-2xl">
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                >
                    {languageOptions.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <p className="text-gray-400 text-center italic mt-4">Start a conversation with your AI companion...</p>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-2xl max-w-[80%] md:max-w-[70%] shadow-lg transition-all duration-300 ${
                            msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none animate-slideInRight' : 'bg-gray-700 text-gray-100 rounded-bl-none animate-slideInLeft'
                        }`}>
                            <p className="text-sm md:text-base break-words">{msg.text}</p>
                            <span className="block text-xs text-right opacity-75 mt-1 text-gray-200">{msg.timestamp}</span>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="p-4 rounded-2xl bg-gray-700 text-gray-100 rounded-bl-none shadow-lg animate-pulse-slow">
                            <span className="typing-dots"><span>.</span><span>.</span><span>.</span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} /> {/* Element to scroll into view */}
            </div>
            <div className="p-4 border-t border-gray-700 flex items-center gap-3 bg-gray-800 rounded-b-2xl">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                    placeholder="Type your message or speak..."
                    className="flex-1 p-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-colors duration-300 text-base"
                    disabled={loading}
                />
                <button
                    onClick={toggleVoiceInput}
                    disabled={loading}
                    className={`p-3 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                        isRecording ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                    } text-white focus:outline-none focus:ring-4 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isRecording ? (
                        <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7.001 7.001 0 006 6.93V17h-2a1 1 0 100 2h4a1 1 0 100-2h-2v-2.07z" clipRule="evenodd"></path></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                    )}
                </button>
                <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l.643-.135a1 1 0 00.124-.105l3.41-3.41a1 1 0 011.414 0l3.41 3.41a1 1 0 00.124.105l.643.135a1 1 0 001.169-1.409l-7-14z"></path></svg>
                </button>
            </div>
        </div>
    );
};

// Journal Entry Component (Voice to Text)
const JournalEntry = () => {
    const { setMessage } = useContext(AppContext);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [journalEntries, setJournalEntries] = useState([]);
    const recognitionRef = useRef(null); // Ref to hold the SpeechRecognition object
    const mediaStreamRef = useRef(null); // Ref to hold the media stream to stop it later
    const [selectedLanguage, setSelectedLanguage] = useState('en-ZA'); // Default to English (South Africa)


    useEffect(() => {
        // Initialize SpeechRecognition on component mount
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setMessage('Speech Recognition API not supported by this browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false; // Stop after a single utterance for journal
        recognition.interimResults = false; // Only return final results for journal
        recognition.lang = selectedLanguage;

        recognition.onstart = () => {
            setIsRecording(true);
            setTranscript(''); // Clear previous transcript
            setMessage('Recording started...');
        };

        recognition.onresult = (event) => {
            const currentTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setTranscript(currentTranscript);
            setMessage('Recording finished. Processing...');
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error in journal:", event.error);
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                setMessage('Microphone access denied. Please enable microphone permissions in your browser settings.');
            } else {
                setMessage(`Speech recognition error: ${event.error}`);
            }
            setIsRecording(false);
            // Stop media stream if there was an error
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
            // Stop media stream when recognition ends
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }

            if (transcript.trim()) {
                // Add the new entry to the in-memory list
                setJournalEntries(prev => [...prev, { text: transcript.trim(), timestamp: new Date().toLocaleString() }]);
                setMessage('Journal entry saved for this session!');
            } else if (recognitionRef.current && recognitionRef.current.readyState !== 'listening') { // Only show 'No speech detected' if recording actually stopped
                setMessage('No speech detected.');
            }
        };

        recognitionRef.current = recognition;

        // Cleanup: stop recognition and media stream if component unmounts while recording
        return () => {
            if (recognitionRef.current && isRecording) {
                recognitionRef.current.stop();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
        };
    }, [selectedLanguage]); // Re-run effect if language changes

    const toggleRecording = async () => {
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setTranscript(''); // Clear transcript before starting new recording
            setMessage('Requesting microphone access...'); // Set message when attempting to start

            try {
                // Request microphone access
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream; // Store the stream to stop it later
                setMessage('Microphone access granted. Starting recording...');
                recognitionRef.current.start();
            } catch (err) {
                console.error("Error accessing microphone:", err);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setMessage('Microphone access denied. Please enable microphone permissions in your browser settings.');
                } else {
                    setMessage(`Failed to access microphone: ${err.message}`);
                }
                setIsRecording(false); // Ensure recording state is off
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-2xl shadow-inner-xl border border-gray-700 p-4">
            <div className="mb-4">
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                >
                    {languageOptions.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 bg-gray-800 rounded-lg p-3 border border-gray-700">
                {journalEntries.length === 0 ? (
                    <p className="text-gray-400 text-center italic mt-4 text-sm">Your journal entries will appear here.</p>
                ) : (
                    <div className="space-y-3">
                        {journalEntries.map((entry, index) => (
                            <div key={index} className="bg-gray-700 p-4 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
                                <p className="text-gray-200 text-sm md:text-base break-words">{entry.text}</p>
                                <span className="block text-xs text-gray-400 text-right mt-1">{entry.timestamp}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center mt-auto gap-3">
                <textarea
                    value={transcript}
                    readOnly
                    placeholder="Speak to see your transcript here..."
                    className="w-full h-28 p-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none resize-none border border-transparent focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 text-base"
                />
                <button
                    onClick={toggleRecording}
                    className={`w-full py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                        isRecording ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    } text-white font-semibold focus:outline-none focus:ring-4 focus:ring-opacity-75`}
                >
                    {isRecording ? (
                        <div className="flex items-center justify-center">
                            <svg className="w-6 h-6 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7.001 7.001 0 006 6.93V17h-2a1 1 0 100 2h4a1 1 0 100-2h-2v-2.07z" clipRule="evenodd"></path></svg>
                            Stop Recording
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                            Start Recording
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};

// Image Generator Component
const ImageGenerator = () => {
    const { setMessage } = useContext(AppContext);
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState([]); // In-memory storage for images

    const generateImage = async () => {
        if (!prompt.trim()) {
            setMessage('Please enter a prompt for the image.');
            return;
        }

        setLoading(true);
        setImageUrl(''); // Clear previous image
        setMessage('Generating image...');

        try {
            const payload = { instances: [{ prompt: prompt }], parameters: { "sampleCount": 1 } };
            const apiKey = "AIzaSyBxWYwq0x4t2QHaZqxy2nnW6mQD8y--wxI"; // Canvas will provide this in runtime for imagen-3.0-generate-002
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const result = await response.json();

            if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
                const newImageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                setImageUrl(newImageUrl);
                // Prepend new image to the list
                setGeneratedImages(prev => [{ url: newImageUrl, prompt: prompt, timestamp: new Date().toLocaleString() }, ...prev]);
                setMessage('Image generated successfully!');
            } else {
                setMessage("Image generation failed or response was empty.");
            }
        } catch (error) {
            console.error("Error generating image:", error);
            setMessage(`Failed to generate image: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = (imgUrl, promptText, timestamp) => {
        const link = document.createElement('a');
        link.href = imgUrl;
        // Create a user-friendly filename
        const filename = `mindwell-image-${promptText.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setMessage(`Downloaded "${filename}"`);
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-2xl shadow-inner-xl border border-gray-700 p-4">
            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 bg-gray-800 rounded-lg p-3 border border-gray-700 space-y-4">
                {generatedImages.length === 0 ? (
                    <p className="text-gray-400 text-center italic mt-4 text-sm">Generated images will appear here.</p>
                ) : (
                    generatedImages.map((img, index) => (
                        <div key={index} className="bg-gray-700 p-3 rounded-xl shadow-md flex flex-col items-center group transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden">
                             <img src={img.url} alt={`Generated from "${img.prompt}"`} className="w-full h-48 object-cover rounded-lg mb-3 transform transition-transform duration-300 group-hover:scale-105" />
                            <p className="text-gray-300 text-sm text-center break-words opacity-90 mb-2">{img.prompt}</p>
                            <span className="block text-xs text-gray-400 text-right w-full mb-3 opacity-75">{img.timestamp}</span>
                            <button
                                onClick={() => downloadImage(img.url, img.prompt, img.timestamp)}
                                className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 text-sm flex items-center justify-center w-full"
                            >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414zM10 3a1 1 0 011 1v7a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                                Download
                            </button>
                        </div>
                    ))
                )}
            </div>
            <div className="flex flex-col items-center mt-auto gap-3">
                {loading && (
                    <div className="text-blue-400 animate-pulse-slow mb-2 text-sm">Generating image, please wait...</div>
                )}
                {/* The currently displayed single image preview */}
                {imageUrl && (
                    <img src={imageUrl} alt="Generated result" className="w-full max-h-48 object-contain rounded-lg mb-3 shadow-xl border border-blue-500 animate-fadeIn" />
                )}
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && generateImage()}
                    placeholder="e.g., 'calm forest with soft light'"
                    className="w-full p-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-colors duration-300 text-base"
                    disabled={loading}
                />
                <button
                    onClick={generateImage}
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                    Generate Image
                </button>
            </div>
        </div>
    );
};

// New SupportSection Component
const SupportSection = () => {
    const [openSection, setOpenSection] = useState(null); // State to manage which section is open

    const toggleSection = (sectionName) => {
        setOpenSection(openSection === sectionName ? null : sectionName);
    };

    const sectionClass = "bg-gray-900 rounded-2xl shadow-inner-xl border border-gray-700";
    const buttonClass = "w-full text-left p-4 flex justify-between items-center bg-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300 hover:bg-gray-700 shadow-md";
    const contentClass = "p-5 bg-gray-800 rounded-b-2xl border-t border-gray-700";
    const linkClass = "text-blue-400 hover:underline transition-colors duration-200";

    return (
        <div className="w-full text-white space-y-4">
            {/* FAQ Section */}
            <div className={sectionClass}>
                <button
                    className={buttonClass}
                    onClick={() => toggleSection('faq')}
                >
                    <h3 className="text-xl font-bold">Frequently Asked Questions (FAQ)</h3>
                    <svg className={`w-6 h-6 transform transition-transform duration-300 ${openSection === 'faq' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                {openSection === 'faq' && (
                    <div className={contentClass}>
                        <h4 className="font-semibold text-lg mb-2">How do I use the Chat with AI feature?</h4>
                        <p className="mb-4 text-gray-300 text-sm leading-relaxed">
                            Simply type your message into the input box and press Enter or click the send button. You can also click the microphone icon to speak your message, and it will be transcribed into the input field. The AI is designed to offer supportive and empathetic responses.
                        </p>
                        <h4 className="font-semibold text-lg mb-2">What is the Voice Journal for?</h4>
                        <p className="mb-4 text-gray-300 text-sm leading-relaxed">
                            The Voice Journal allows you to record your thoughts and feelings using your voice. The app will transcribe your speech into text, creating a digital journal entry for your reflection. Remember, data is currently stored only for the current session.
                        </p>
                        <h4 className="font-semibold text-lg mb-2">How can I generate inspiring images?</h4>
                        <p className="mb-4 text-gray-300 text-sm leading-relaxed">
                            In the "Inspiring Images" section, type a descriptive prompt (e.g., "calm forest with soft light," "peaceful sunset over mountains") into the input field and click "Generate Image." The AI will create a visual based on your description.
                        </p>
                        <h4 className="font-semibold text-lg mb-2">My microphone isn't working. What should I do?</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            If you encounter a "Microphone access denied" error, please check your browser's site settings to ensure that microphone access is granted for this application. You might need to refresh the page after adjusting permissions.
                        </p>
                    </div>
                )}
            </div>

            {/* Wellness Tips Section */}
            <div className={sectionClass}>
                <button
                    className={buttonClass}
                    onClick={() => toggleSection('tips')}
                >
                    <h3 className="text-xl font-bold">Wellness Tips</h3>
                    <svg className={`w-6 h-6 transform transition-transform duration-300 ${openSection === 'tips' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                {openSection === 'tips' && (
                    <div className={contentClass}>
                        <p className="mb-4 text-gray-300 text-sm leading-relaxed">Here are some general tips for promoting mental wellness:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                            <li>**Mindful Breathing:** Take a few deep breaths when feeling overwhelmed. Inhale slowly through your nose, hold for a count, and exhale slowly through your mouth.</li>
                            <li>**Stay Connected:** Reach out to friends, family, or support groups. Sharing your feelings can be incredibly helpful.</li>
                            <li>**Regular Exercise:** Physical activity can significantly boost your mood and reduce stress. Even a short walk can make a difference.</li>
                            <li>**Balanced Diet:** Fuel your body with nutritious foods. What you eat can affect your energy levels and mood.</li>
                            <li>**Sufficient Sleep:** Aim for 7-9 hours of quality sleep per night. Sleep deprivation can impact your mental state.</li>
                            <li>**Limit Screen Time:** Take breaks from digital devices, especially before bedtime.</li>
                            <li>**Engage in Hobbies:** Dedicate time to activities you enjoy and that bring you a sense of accomplishment or relaxation.</li>
                            <li>**Practice Gratitude:** Regularly reflect on things you are thankful for. This can shift your perspective positively.</li>
                        </ul>
                    </div>
                )}
            </div>

            {/* External Resources Section */}
            <div className={sectionClass}>
                <button
                    className={buttonClass}
                    onClick={() => toggleSection('resources')}
                >
                    <h3 className="text-xl font-bold">External Resources</h3>
                    <svg className={`w-6 h-6 transform transition-transform duration-300 ${openSection === 'resources' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                {openSection === 'resources' && (
                    <div className={contentClass}>
                        <p className="mb-4 text-gray-300 text-sm leading-relaxed">If you are in distress or need professional help, please reach out to these resources:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                            <li>
                                **South African Depression and Anxiety Group (SADAG)**:
                                <br />
                                <a href="https://www.sadag.org/" target="_blank" rel="noopener noreferrer" className={linkClass}>Website</a> | Helpline: 0800 21 22 23 (8am-8pm), 0800 456 789 (24hr), or SMS 31393
                            </li>
                            <li>
                                **Lifeline Southern Africa**:
                                <br />
                                <a href="https://www.lifeline.org.za/" target="_blank" rel="noopener noreferrer" className={linkClass}>Website</a> | Crisis Line: 0861 322 322
                            </li>
                            <li>
                                **Childline South Africa**: (for children and concerned adults)
                                <br />
                                <a href="https://www.childline.org.za/" target="_blank" rel="noopener noreferrer" className={linkClass}>Website</a> | Helpline: 08000 55 555
                            </li>
                            <li>
                                **National Institute of Mental Health (NIMH) - US (General Info)**:
                                <br />
                                <a href="https://www.nimh.nih.gov/health/find-help/index.shtml" target="_blank" rel="noopener noreferrer" className={linkClass}>Find Help</a>
                            </li>
                        </ul>
                        <p className="mt-4 italic text-gray-400 text-xs">
                            Disclaimer: MindWell AI is a support tool and not a substitute for professional medical advice, diagnosis, or treatment. If you are experiencing a mental health crisis, please contact a qualified healthcare professional or emergency services immediately.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// New MeditationSection Component
const MeditationSection = () => {
    const { setMessage } = useContext(AppContext);
    const [meditationDuration, setMeditationDuration] = useState(5); // Default to 5 minutes
    const [timeRemaining, setTimeRemaining] = useState(0); // Time in seconds
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);
    // Removed audioRef for TTS, as voiceover is being removed
    const calmingSoundRef = useRef(new Audio()); // Audio element for calming sound playback

    // Removed ttsLoading, ttsLanguage, ttsGender states
    // Removed ttsLanguageOptions and getVoiceName function

    const [selectedCalmingSound, setSelectedCalmingSound] = useState(''); // Stores the URL of the selected calming sound
    const [calmingSoundVolume, setCalmingSoundVolume] = useState(0.5); // Default volume for calming sound

    // Calming sound options (placeholder URLs - replace with actual paths in a real app)
    const calmingSounds = [
        { name: 'None', url: '' },
        { name: 'Rain', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }, // Placeholder
        { name: 'Forest', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }, // Placeholder
        { name: 'Ocean Waves', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }, // Placeholder
        { name: 'Zen Chime', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }, // Placeholder
    ];


    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining((prevTime) => prevTime - 1);
            }, 1000);
            if (selectedCalmingSound && calmingSoundRef.current.paused) {
                calmingSoundRef.current.play();
            }
        } else if (timeRemaining === 0 && isRunning) {
            setIsRunning(false);
            clearInterval(timerRef.current);
            setMessage('Meditation session complete! Good job.');
            if (calmingSoundRef.current) {
                calmingSoundRef.current.pause();
                calmingSoundRef.current.currentTime = 0;
            }
        } else if (!isRunning && calmingSoundRef.current) {
            // If timer is paused/stopped, pause calming sound
            calmingSoundRef.current.pause();
        }

        return () => clearInterval(timerRef.current);
    }, [isRunning, timeRemaining, selectedCalmingSound]);

    // Update calming sound source and volume when selection or volume changes
    useEffect(() => {
        if (calmingSoundRef.current) {
            calmingSoundRef.current.src = selectedCalmingSound;
            calmingSoundRef.current.loop = true; // Ensure it loops
            calmingSoundRef.current.volume = calmingSoundVolume;
            if (isRunning && selectedCalmingSound) { // Only play if timer is running and a sound is selected
                calmingSoundRef.current.play();
            } else {
                calmingSoundRef.current.pause();
            }
        }
    }, [selectedCalmingSound, calmingSoundVolume, isRunning]);


    const startMeditationTimer = () => {
        if (meditationDuration > 0) {
            setTimeRemaining(meditationDuration * 60);
            setIsRunning(true);
            setMessage(`Starting ${meditationDuration}-minute meditation...`);
            if (selectedCalmingSound) {
                calmingSoundRef.current.play();
            }
        } else {
            setMessage('Please set a duration greater than 0.');
        }
    };

    const pauseMeditationTimer = () => {
        setIsRunning(false);
        clearInterval(timerRef.current);
        setMessage('Meditation paused.');
        if (calmingSoundRef.current) {
            calmingSoundRef.current.pause();
        }
    };

    const resetMeditationTimer = () => {
        setIsRunning(false);
        clearInterval(timerRef.current);
        setTimeRemaining(meditationDuration * 60); // Reset to initial duration
        setMessage('Meditation reset.');
        // Removed audioRef related reset
        if (calmingSoundRef.current) {
            calmingSoundRef.current.pause();
            calmingSoundRef.current.currentTime = 0;
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };


    return (
        <div className="w-full text-white bg-gray-900 rounded-2xl shadow-inner-xl border border-gray-700 p-5">
            <div className="mb-6 w-full text-center">
                <h3 className="text-2xl font-bold mb-3 drop-shadow-md">Benefits of Meditation</h3>
                <p className="text-gray-300 text-sm leading-relaxed opacity-90">
                    Meditation offers a powerful way to reduce stress, improve focus, and cultivate inner peace. Regular practice can lead to a new perspective on stressful situations, increased self-awareness, and a reduction in negative emotions. It can also contribute to better sleep and overall emotional well-being.
                </p>
                <p className="text-gray-300 mt-2 text-sm leading-relaxed opacity-90">
                    By focusing on your breath and observing thoughts without judgment, you can train your mind to be more present and less reactive to daily challenges.
                </p>
            </div>

            <div className="w-full mb-6 p-5 bg-gray-800 rounded-2xl shadow-md flex flex-col border border-gray-700">
                <h3 className="text-2xl font-bold text-center mb-4 drop-shadow-md">Guided Meditation (Text Only)</h3>
                <p className="text-gray-200 italic mb-5 text-center text-sm opacity-90">
                    Find a comfortable position, either sitting or lying down. Gently close your eyes or soften your gaze.
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-300 mb-6 text-sm leading-relaxed">
                    <li>**Notice Your Breath:** Bring your attention to your breath. Feel the gentle rise and fall of your abdomen, or the sensation of air entering and leaving your nostrils. There's no need to change anything, just observe.</li>
                    <li>**Acknowledge Thoughts:** As thoughts arise, simply acknowledge them without judgment. Imagine them as clouds passing in the sky. Let them drift by, and gently bring your attention back to your breath.</li>
                    <li>**Body Scan:** Briefly scan your body. Notice any areas of tension, and on each exhale, imagine those tensions softening and releasing.</li>
                    <li>**Cultivate Peace:** Allow yourself to rest in this present moment. Feel a sense of calm and peace washing over you. Remind yourself that you are safe and complete, just as you are.</li>
                    <li>**Gentle Return:** When you're ready, slowly deepen your breath. Wiggle your fingers and toes. Gently open your eyes, bringing this sense of peace back into your day.</li>
                </ol>

                {/* Removed TTS language/gender selectors and play/stop buttons */}
            </div>

            <div className="w-full p-5 bg-gray-800 rounded-2xl shadow-md flex flex-col items-center border border-gray-700">
                <h3 className="text-2xl font-bold mb-4 drop-shadow-md">Meditation Timer</h3>
                <div className="flex items-center space-x-3 mb-5">
                    <label htmlFor="meditation-duration" className="text-gray-300 text-lg font-medium">Duration (minutes):</label>
                    <input
                        id="meditation-duration"
                        type="number"
                        min="1"
                        value={meditationDuration}
                        onChange={(e) => setMeditationDuration(parseInt(e.target.value) || 0)}
                        className="w-24 p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 text-lg text-center"
                        disabled={isRunning}
                    />
                </div>

                {/* Calming Sounds Selection */}
                <div className="flex flex-col items-center w-full mb-5">
                    <label htmlFor="calming-sound-select" className="text-gray-300 text-base font-medium mb-2">Calming Sound:</label>
                    <select
                        id="calming-sound-select"
                        value={selectedCalmingSound}
                        onChange={(e) => setSelectedCalmingSound(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 text-base"
                    >
                        {calmingSounds.map((sound) => (
                            <option key={sound.name} value={sound.url}>
                                {sound.name}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="calming-sound-volume" className="text-gray-300 text-base font-medium mt-4 mb-2">Volume:</label>
                    <input
                        id="calming-sound-volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={calmingSoundVolume}
                        onChange={(e) => setCalmingSoundVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                </div>

                <div className="text-7xl font-mono text-yellow-300 mb-7 drop-shadow-lg animate-fadeIn">
                    {formatTime(timeRemaining || meditationDuration * 60)}
                </div>
                <div className="flex space-x-4">
                    {!isRunning ? (
                        <button
                            onClick={startMeditationTimer}
                            className="bg-green-600 text-white font-semibold py-3 px-7 rounded-xl shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                            disabled={meditationDuration <= 0}
                        >
                            Start
                        </button>
                    ) : (
                        <button
                            onClick={pauseMeditationTimer}
                            className="bg-orange-600 text-white font-semibold py-3 px-7 rounded-xl shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-75 text-base"
                        >
                            Pause
                        </button>
                    )}
                    <button
                        onClick={resetMeditationTimer}
                        className="bg-red-600 text-white font-semibold py-3 px-7 rounded-xl shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75 text-base"
                    >
                        Reset
                    </button>
                </div>
                <audio ref={calmingSoundRef} className="hidden"></audio>
            </div>
        </div>
    );
};


export default App; // Export the main App component
