import React, { useState, useEffect, createContext, useContext, useRef } from 'react';

// AppContext to manage global state like user ID and messages
const AppContext = createContext(null);

// Main App Component
const App = () => {
    // App UI states
    const [currentPage, setCurrentPage] = useState('login');
    const [userId, setUserId] = useState(null); // User ID will be stored here for the guest session
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true); // Initial app loading

    // Simulate an initial app load and readiness
    useEffect(() => {
        // In a real application, you might perform initial data fetching or setup here
        // For this guest-only demo, we just set loading to false after a short delay
        setTimeout(() => {
            setLoading(false);
            setMessage('Welcome! Please enter as guest.'); // Initial message for the user
        }, 500); // Simulate a small loading time
    }, []); // Empty dependency array ensures this runs once on mount

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
                <div className="text-xl animate-pulse">Loading MindWell AI...</div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={{ userId, setUserId, setMessage }}>
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
                {currentPage === 'dashboard' && <DashboardPage onLogout={() => setCurrentPage('login')} />} {/* Pass onLogout prop */}
            </div>
        </AppContext.Provider>
    );
};

// Login Page Component
const LoginPage = ({ onLoginSuccess }) => {
    const { setUserId, setMessage } = useContext(AppContext);
    const [loading, setLoading] = useState(false);

    // Handles logging in as a guest (non-persistent session, purely client-side)
    const handleGuestLogin = () => {
        setLoading(true);
        // Generates a simple, non-persistent session ID for guest user
        const newUserId = `guest-${crypto.randomUUID().substring(0, 8)}`;
        setUserId(newUserId);
        setMessage(`Welcome, ${newUserId}! Your session is for this visit only.`);
        setLoading(false);
        onLoginSuccess(); // Navigate to dashboard
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
            <div className="bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-3xl shadow-3xl p-8 md:p-14 w-full max-w-md border border-purple-500 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-purple-glow">
                <h1 className="text-5xl font-extrabold text-center text-white mb-6 tracking-wide drop-shadow-lg">
                    MindWell AI
                </h1>
                <p className="text-white text-center mb-10 text-lg opacity-90 leading-relaxed">
                    Your personal AI companion for mental wellness.
                    Enter as a guest to begin.
                </p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleGuestLogin}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-400 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed text-xl tracking-wide"
                    >
                        {loading ? 'Entering...' : 'Enter as Guest'}
                    </button>
                </div>
                <p className="text-gray-300 text-sm text-center mt-8 opacity-80">
                    Your data will not be saved beyond this session.
                </p>
            </div>
        </div>
    );
};

// Dashboard Page Component
const DashboardPage = ({ onLogout }) => {
    const { userId, setMessage, setUserId } = useContext(AppContext);

    // Handles ending the guest session
    const handleEndSession = () => {
        setUserId(null); // Clear the user ID
        setMessage('Session ended. See you next time!');
        onLogout(); // Navigate back to the login page
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-6 relative z-10">
            <header className="w-full max-w-5xl text-center py-8">
                <h1 className="text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg animate-fadeInDown">
                    MindWell AI Dashboard
                </h1>
                {userId && <p className="text-gray-300 mt-4 text-xl opacity-90 animate-fadeInUp">Welcome, <span className="font-bold text-purple-300">{userId}</span>!</p>}
                
                {/* Logout/End Session button for guest users */}
                <button
                    onClick={handleEndSession}
                    className="mt-6 bg-red-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75 flex items-center justify-center mx-auto text-base"
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"></path></svg>
                    End Session
                </button>
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
    const [currentTranscript, setCurrentTranscript] = useState(''); // Holds real-time transcript
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
            setCurrentTranscript('');
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
            setCurrentTranscript(interimTranscript);
            setInput(finalTranscript || interimTranscript); // Update input field with either final or interim
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
            setCurrentTranscript('');
            setInput('');
            setMessage('Requesting microphone access for chat...');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;
                setMessage('Microphone access granted. Start speaking for chat input...');
                recognitionRef.current.start();
            } catch (err) {
                console.error("Error accessing microphone for chat:", err);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setMessage('Microphone access denied. Please enable microphone permissions in your browser settings to use voice input for chat.');
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
        <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-inner">
            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <p className="text-gray-400 text-center italic mt-4">Start a conversation with your AI companion...</p>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-xl max-w-xs md:max-w-md lg:max-w-lg shadow-md ${
                            msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-100 rounded-bl-none'
                        }`}>
                            <p className="text-sm break-words">{msg.text}</p>
                            <span className="block text-xs text-right opacity-75 mt-1">{msg.timestamp}</span>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-xl bg-gray-700 text-gray-100 rounded-bl-none shadow-md">
                            <span className="animate-pulse">Typing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} /> {/* Element to scroll into view */}
            </div>
            <div className="p-4 border-t border-gray-700 flex flex-col gap-2">
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    {languageOptions.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                        placeholder="Type your message or speak..."
                        className="flex-1 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-colors"
                        disabled={loading}
                    />
                    <button
                        onClick={toggleVoiceInput}
                        disabled={loading}
                        className={`p-3 rounded-lg shadow-lg transition-colors duration-300 ${
                            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                        } text-white focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
                            isRecording ? 'focus:ring-red-500' : 'focus:ring-purple-500'
                        }`}
                    >
                        {isRecording ? (
                            <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7.001 7.001 0 006 6.93V17h-2a1 1 0 100 2h4a1 1 0 100-2h-2v-2.07z" clipRule="evenodd"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                        )}
                    </button>
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l.643-.135a1 1 0 00.124-.105l3.41-3.41a1 1 0 011.414 0l3.41 3.41a1 1 0 00.124.105l.643.135a1 1 0 001.169-1.409l-7-14z"></path></svg>
                    </button>
                </div>
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
                setMessage('Microphone access denied. Please enable microphone permissions in your browser settings to use voice journaling.');
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
                    setMessage('Microphone access denied. Please enable microphone permissions in your browser settings to use voice journaling.');
                } else {
                    setMessage(`Failed to access microphone: ${err.message}`);
                }
                setIsRecording(false); // Ensure recording state is off
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-inner p-4">
            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4">
                {journalEntries.length === 0 ? (
                    <p className="text-gray-400 text-center italic">Your journal entries will appear here.</p>
                ) : (
                    <div className="space-y-3">
                        {journalEntries.map((entry, index) => (
                            <div key={index} className="bg-gray-700 p-3 rounded-lg shadow-md">
                                <p className="text-gray-200 text-sm break-words">{entry.text}</p>
                                <span className="block text-xs text-gray-400 text-right mt-1">{entry.timestamp}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center mt-auto gap-3">
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    {languageOptions.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
                <textarea
                    value={transcript}
                    readOnly
                    placeholder="Speak to see your transcript here..."
                    className="w-full h-24 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none resize-none border border-transparent"
                />
                <button
                    onClick={toggleRecording}
                    className={`w-full py-3 px-6 rounded-lg shadow-lg transition-colors duration-300 transform hover:-translate-y-1 ${
                        isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    } text-white font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
                        isRecording ? 'focus:ring-red-500' : 'focus:ring-green-500'
                    }`}
                >
                    {isRecording ? (
                        <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7.001 7.001 0 006 6.93V17h-2a1 1 0 100 2h4a1 1 0 100-2h-2v-2.07z" clipRule="evenodd"></path></svg>
                            Stop Recording
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
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
                setGeneratedImages(prev => [...prev, { url: newImageUrl, prompt: prompt, timestamp: new Date().toLocaleString() }]);
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

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-inner p-4">
            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4">
                {generatedImages.length === 0 ? (
                    <p className="text-gray-400 text-center italic">Generated images will appear here.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {generatedImages.map((img, index) => (
                            <div key={index} className="bg-gray-700 p-3 rounded-lg shadow-md flex flex-col items-center">
                                <img src={img.url} alt={`Generated from "${img.prompt}"`} className="w-full h-auto rounded-lg mb-2 object-cover" />
                                <p className="text-gray-300 text-sm text-center break-words">{img.prompt}</p>
                                <span className="block text-xs text-gray-400 text-right w-full mt-1">{img.timestamp}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center mt-auto gap-3">
                {loading && (
                    <div className="text-blue-400 animate-pulse mb-2">Generating image, please wait...</div>
                )}
                {imageUrl && (
                    <img src={imageUrl} alt="Generated result" className="w-full max-h-64 object-contain rounded-lg mb-3 shadow-md" />
                )}
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && generateImage()}
                    placeholder="e.g., 'calm forest with soft light'"
                    className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-colors"
                    disabled={loading}
                />
                <button
                    onClick={generateImage}
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-purple-700 transition-colors duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
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

    return (
        <div className="w-full text-white">
            {/* FAQ Section */}
            <div className="mb-4 bg-gray-800 rounded-lg shadow-md">
                <button
                    className="w-full text-left p-4 flex justify-between items-center bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors hover:bg-gray-600"
                    onClick={() => toggleSection('faq')}
                >
                    <h3 className="text-xl font-bold">Frequently Asked Questions (FAQ)</h3>
                    <svg className={`w-6 h-6 transform transition-transform ${openSection === 'faq' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                {openSection === 'faq' && (
                    <div className="p-4 bg-gray-800 rounded-b-lg border-t border-gray-700">
                        <h4 className="font-semibold text-lg mb-2">How do I use the Chat with AI feature?</h4>
                        <p className="mb-4 text-gray-300">
                            Simply type your message into the input box and press Enter or click the send button. You can also click the microphone icon to speak your message, and it will be transcribed into the input field. The AI is designed to offer supportive and empathetic responses.
                        </p>
                        <h4 className="font-semibold text-lg mb-2">What is the Voice Journal for?</h4>
                        <p className="mb-4 text-gray-300">
                            The Voice Journal allows you to record your thoughts and feelings using your voice. The app will transcribe your speech into text, creating a digital journal entry for your reflection. Remember, data is currently stored only for the current session.
                        </p>
                        <h4 className="font-semibold text-lg mb-2">How can I generate inspiring images?</h4>
                        <p className="mb-4 text-gray-300">
                            In the "Inspiring Images" section, type a descriptive prompt (e.g., "calm forest with soft light," "peaceful sunset over mountains") into the input field and click "Generate Image." The AI will create a visual based on your description.
                        </p>
                        <h4 className="font-semibold text-lg mb-2">My microphone isn't working. What should I do?</h4>
                        <p className="text-gray-300">
                            If you encounter a "Microphone access denied" error, please check your browser's site settings to ensure that microphone access is granted for this application. You might need to refresh the page after adjusting permissions.
                        </p>
                    </div>
                )}
            </div>

            {/* Wellness Tips Section */}
            <div className="mb-4 bg-gray-800 rounded-lg shadow-md">
                <button
                    className="w-full text-left p-4 flex justify-between items-center bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors hover:bg-gray-600"
                    onClick={() => toggleSection('tips')}
                >
                    <h3 className="text-xl font-bold">Wellness Tips</h3>
                    <svg className={`w-6 h-6 transform transition-transform ${openSection === 'tips' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                {openSection === 'tips' && (
                    <div className="p-4 bg-gray-800 rounded-b-lg border-t border-gray-700">
                        <p className="mb-4 text-gray-300">Here are some general tips for promoting mental wellness:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
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
            <div className="bg-gray-800 rounded-lg shadow-md">
                <button
                    className="w-full text-left p-4 flex justify-between items-center bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors hover:bg-gray-600"
                    onClick={() => toggleSection('resources')}
                >
                    <h3 className="text-xl font-bold">External Resources</h3>
                    <svg className={`w-6 h-6 transform transition-transform ${openSection === 'resources' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
                {openSection === 'resources' && (
                    <div className="p-4 bg-gray-800 rounded-b-lg border-t border-gray-700">
                        <p className="mb-4 text-gray-300">If you are in distress or need professional help, please reach out to these resources:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                            <li>
                                **South African Depression and Anxiety Group (SADAG)**:
                                <br />
                                <a href="https://www.sadag.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Website</a> | Helpline: 0800 21 22 23 (8am-8pm), 0800 456 789 (24hr), or SMS 31393
                            </li>
                            <li>
                                **Lifeline Southern Africa**:
                                <br />
                                <a href="https://www.lifeline.org.za/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Website</a> | Crisis Line: 0861 322 322
                            </li>
                            <li>
                                **Childline South Africa**: (for children and concerned adults)
                                <br />
                                <a href="https://www.childline.org.za/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Website</a> | Helpline: 08000 55 555
                            </li>
                            <li>
                                **National Institute of Mental Health (NIMH) - US (General Info)**:
                                <br />
                                <a href="https://www.nimh.nih.gov/health/find-help/index.shtml" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Find Help</a>
                            </li>
                        </ul>
                        <p className="mt-4 italic text-gray-400">
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
    const audioRef = useRef(new Audio()); // Audio element for TTS playback

    const [ttsLoading, setTtsLoading] = useState(false);
    const [ttsLanguage, setTtsLanguage] = useState('en-ZA');
    const [ttsGender, setTtsGender] = useState('FEMALE'); // Default to female

    // Guided meditation script
    const guidedMeditationScript = `
        Find a comfortable position, either sitting or lying down. Gently close your eyes or soften your gaze.

        Bring your attention to your breath. Feel the gentle rise and fall of your abdomen, or the sensation of air entering and leaving your nostrils. There's no need to change anything, just observe.

        As thoughts arise, simply acknowledge them without judgment. Imagine them as clouds passing in the sky. Let them drift by, and gently bring your attention back to your breath.

        Briefly scan your body. Notice any areas of tension, and on each exhale, imagine those tensions softening and releasing.

        Allow yourself to rest in this present moment. Feel a sense of calm and peace washing over you. Remind yourself that you are safe and complete, just as you are.

        When you're ready, slowly deepen your breath. Wiggle your fingers and toes. Gently open your eyes, bringing this sense of peace back into your day.
    `;

    // Language options for Text-to-Speech (more specific for TTS voices)
    const ttsLanguageOptions = [
        { code: 'en-US', name: 'English (US)', voices: [{ type: 'FEMALE', name: 'en-US-Standard-C' }, { type: 'MALE', name: 'en-US-Standard-D' }] },
        { code: 'en-GB', name: 'English (UK)', voices: [{ type: 'FEMALE', name: 'en-GB-Standard-A' }, { type: 'MALE', name: 'en-GB-Standard-B' }] },
        { code: 'en-AU', name: 'English (Australia)', voices: [{ type: 'FEMALE', name: 'en-AU-Standard-A' }, { type: 'MALE', name: 'en-AU-Standard-B' }] },
        { code: 'en-ZA', name: 'English (South Africa)', voices: [{ type: 'FEMALE', name: 'en-ZA-Standard-A' }, { type: 'MALE', name: 'en-ZA-Standard-B' }] }, // Placeholder, actual voices may vary
        { code: 'af-ZA', name: 'Afrikaans (South Africa)', voices: [{ type: 'FEMALE', name: 'af-ZA-Standard-A' }, { type: 'MALE', name: 'af-ZA-Standard-B' }] }, // Placeholder
        { code: 'zu-ZA', name: 'isiZulu (South Africa)', voices: [{ type: 'FEMALE', name: 'zu-ZA-Standard-A' }, { type: 'MALE', name: 'zu-ZA-Standard-B' }] }, // Placeholder
        { code: 'xh-ZA', name: 'isiXhosa (South Africa)', voices: [{ type: 'FEMALE', name: 'xh-ZA-Standard-A' }, { type: 'MALE', name: 'xh-ZA-Standard-B' }] }, // Placeholder
        { code: 'fr-FR', name: 'French (France)', voices: [{ type: 'FEMALE', name: 'fr-FR-Standard-A' }, { type: 'MALE', name: 'fr-FR-Standard-B' }] },
        { code: 'es-ES', name: 'Spanish (Spain)', voices: [{ type: 'FEMALE', name: 'es-ES-Standard-A' }, { type: 'MALE', name: 'es-ES-Standard-B' }] },
        { code: 'de-DE', name: 'German (Germany)', voices: [{ type: 'FEMALE', name: 'de-DE-Standard-A' }, { type: 'MALE', name: 'de-DE-Standard-B' }] },
    ];

    // Get the full voice name based on language code and gender
    const getVoiceName = (langCode, gender) => {
        const lang = ttsLanguageOptions.find(option => option.code === langCode);
        if (lang) {
            const voice = lang.voices.find(v => v.type === gender);
            return voice ? voice.name : lang.voices[0].name; // Fallback to first available voice
        }
        return 'en-US-Standard-C'; // Default fallback
    };


    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeRemaining === 0 && isRunning) {
            setIsRunning(false);
            clearInterval(timerRef.current);
            setMessage('Meditation session complete! Good job.');
        }

        return () => clearInterval(timerRef.current);
    }, [isRunning, timeRemaining]);

    const startMeditationTimer = () => {
        if (meditationDuration > 0) {
            setTimeRemaining(meditationDuration * 60);
            setIsRunning(true);
            setMessage(`Starting ${meditationDuration}-minute meditation...`);
        } else {
            setMessage('Please set a duration greater than 0.');
        }
    };

    const pauseMeditationTimer = () => {
        setIsRunning(false);
        clearInterval(timerRef.current);
        setMessage('Meditation paused.');
    };

    const resetMeditationTimer = () => {
        setIsRunning(false);
        clearInterval(timerRef.current);
        setTimeRemaining(meditationDuration * 60); // Reset to initial duration
        setMessage('Meditation reset.');
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = ''; // Clear audio source
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const playGuidedMeditation = async () => {
        setTtsLoading(true);
        setMessage('Generating voiceover...');
        try {
            const voiceName = getVoiceName(ttsLanguage, ttsGender);

            const payload = {
                input: { text: guidedMeditationScript },
                voice: { languageCode: ttsLanguage, name: voiceName, ssmlGender: ttsGender },
                audioConfig: { audioEncoding: 'MP3' }
            };

            const apiKey = ""; // Canvas will provide this in runtime for text-to-speech
            const apiUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`TTS API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const result = await response.json();
            if (result.audioContent) {
                const audioBlob = new Blob([Uint8Array.from(atob(result.audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(audioBlob);

                audioRef.current.src = audioUrl;
                audioRef.current.play();
                setMessage('Guided meditation playing...');

                // Revoke object URL after audio ends to free up memory
                audioRef.current.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    setMessage('Guided meditation finished.');
                };
            } else {
                setMessage("Failed to generate audio content.");
            }
        } catch (error) {
            console.error("Error generating or playing TTS:", error);
            setMessage(`Failed to play guided meditation: ${error.message}`);
        } finally {
            setTtsLoading(false);
        }
    };

    const stopGuidedMeditation = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setMessage('Guided meditation stopped.');
        }
    };


    return (
        <div className="w-full text-white bg-gray-800 rounded-lg shadow-inner p-4 flex flex-col items-center">
            <div className="mb-6 w-full">
                <h3 className="text-2xl font-bold text-center mb-3">Benefits of Meditation</h3>
                <p className="text-gray-300 mb-4 text-center">
                    Meditation offers a powerful way to reduce stress, improve focus, and cultivate inner peace. Regular practice can lead to a new perspective on stressful situations, increased self-awareness, and a reduction in negative emotions. It can also contribute to better sleep and overall emotional well-being.
                </p>
                <p className="text-gray-300 text-center">
                    By focusing on your breath and observing thoughts without judgment, you can train your mind to be more present and less reactive to daily challenges.
                </p>
            </div>

            <div className="w-full mb-6 p-4 bg-gray-700 rounded-lg shadow-md flex flex-col">
                <h3 className="text-2xl font-bold text-center mb-3">Guided Meditation</h3>
                <p className="text-gray-200 italic mb-4 text-center">
                    Find a comfortable position, either sitting or lying down. Gently close your eyes or soften your gaze.
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-300 mb-4">
                    <li>**Notice Your Breath:** Bring your attention to your breath. Feel the gentle rise and fall of your abdomen, or the sensation of air entering and leaving your nostrils. There's no need to change anything, just observe.</li>
                    <li>**Acknowledge Thoughts:** As thoughts arise, simply acknowledge them without judgment. Imagine them as clouds passing in the sky. Let them drift by, and gently bring your attention back to your breath.</li>
                    <li>**Body Scan:** Briefly scan your body. Notice any areas of tension, and on each exhale, imagine those tensions softening and releasing.</li>
                    <li>**Cultivate Peace:** Allow yourself to rest in this present moment. Feel a sense of calm and peace washing over you. Remind yourself that you are safe and complete, just as you are.</li>
                    <li>**Gentle Return:** When you're ready, slowly deepen your breath. Wiggle your fingers and toes. Gently open your eyes, bringing this sense of peace back into your day.</li>
                </ol>

                <div className="flex flex-col gap-3 w-full">
                    <label htmlFor="tts-language" className="text-gray-300">Voice Language:</label>
                    <select
                        id="tts-language"
                        value={ttsLanguage}
                        onChange={(e) => setTtsLanguage(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        {ttsLanguageOptions.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.name}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="tts-gender" className="text-gray-300">Voice Gender:</label>
                    <select
                        id="tts-gender"
                        value={ttsGender}
                        onChange={(e) => setTtsGender(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        {/* Dynamically show genders based on selected language's available voices */}
                        {ttsLanguageOptions.find(lang => lang.code === ttsLanguage)?.voices.map(voice => (
                            <option key={voice.type} value={voice.type}>
                                {voice.type === 'FEMALE' ? 'Female' : 'Male'}
                            </option>
                        )) || <option value="FEMALE">Female</option>} {/* Fallback if no voices found */}
                    </select>

                    <div className="flex justify-center gap-4 mt-4">
                        <button
                            onClick={playGuidedMeditation}
                            disabled={ttsLoading}
                            className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {ttsLoading ? 'Generating...' : 'Play Voiceover'}
                        </button>
                        <button
                            onClick={stopGuidedMeditation}
                            disabled={!audioRef.current.src || ttsLoading}
                            className="bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Stop Voiceover
                        </button>
                    </div>
                    {/* Hidden audio element for playback */}
                    <audio ref={audioRef} className="hidden"></audio>
                </div>
            </div>

            <div className="w-full p-4 bg-gray-700 rounded-lg shadow-md flex flex-col items-center">
                <h3 className="text-2xl font-bold mb-3">Meditation Timer</h3>
                <div className="flex items-center space-x-2 mb-4">
                    <label htmlFor="meditation-duration" className="text-gray-300 text-lg">Duration (minutes):</label>
                    <input
                        id="meditation-duration"
                        type="number"
                        min="1"
                        value={meditationDuration}
                        onChange={(e) => setMeditationDuration(parseInt(e.target.value) || 0)}
                        className="w-20 p-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        disabled={isRunning}
                    />
                </div>
                <div className="text-6xl font-mono text-yellow-300 mb-6 drop-shadow-lg">
                    {formatTime(timeRemaining || meditationDuration * 60)}
                </div>
                <div className="flex space-x-4">
                    {!isRunning ? (
                        <button
                            onClick={startMeditationTimer}
                            className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={meditationDuration <= 0}
                        >
                            Start
                        </button>
                    ) : (
                        <button
                            onClick={pauseMeditationTimer}
                            className="bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75"
                        >
                            Pause
                        </button>
                    )}
                    <button
                        onClick={resetMeditationTimer}
                        className="bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                        disabled={isRunning} // Disable reset button if timer is running
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};


export default App; // Export the main App component
