import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from './App'; // Assuming AppContext is exported from App.jsx

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

const Chatbot = () => {
    const { setMessage } = useContext(AppContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const [isRecording, setIsRecording] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState(''); // Holds real-time transcript
    const recognitionRef = useRef(null); // Ref to hold the SpeechRecognition object
    const mediaStreamRef = useRef(null); // Ref to hold the media stream to stop it later
    const [selectedLanguage, setSelectedLanguage] = useState('en-ZA'); // Default to English (South Africa)
    const [microphoneStatus, setMicrophoneStatus] = useState('idle'); // 'idle', 'requesting', 'granted', 'denied', 'unsupported'

    // Scroll to bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Speech Recognition setup for Chat
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setMicrophoneStatus('unsupported');
            return;
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
            setMicrophoneStatus('granted'); // Confirm microphone is active
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
            // Update input field with either final or interim, prioritizing final
            setInput(finalTranscript || interimTranscript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error in chat:", event.error);
            setMicrophoneStatus('denied'); // Set status to denied on error
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                setMessage('Microphone access denied. Please enable microphone permissions in your browser settings.');
            } else if (event.error === 'no-speech') {
                setMessage('No speech detected. Please try again.');
            } else if (event.error === 'audio-capture') {
                setMessage('Could not find or access microphone.');
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
            if (microphoneStatus !== 'denied') { // Don't reset if already denied
                setMicrophoneStatus('idle');
            }
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
    }, [selectedLanguage, isRecording]); // Re-run effect if language or isRecording changes to ensure cleanup

    const toggleVoiceInput = async () => {
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setCurrentTranscript('');
            setInput('');
            setMicrophoneStatus('requesting'); // Indicate microphone request
            setMessage('Requesting microphone access for chat...');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;
                setMessage('Microphone access granted. Start speaking for chat input...');
                recognitionRef.current.start();
            } catch (err) {
                console.error("Error accessing microphone for chat:", err);
                setMicrophoneStatus('denied'); // Set status to denied on error
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

        // Stop recording if active when sending message (for continuous recognition)
        if (isRecording) {
            recognitionRef.current.stop();
        }

        try {
            let chatHistory = messages.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
            // Add the new user message to chat history for the API call
            chatHistory.push({ role: "user", parts: [{ text: userMessage.text }] });

            const payload = { contents: chatHistory };
            // === IMPORTANT: REPLACE WITH YOUR ACTUAL GEMINI API KEY ===
            // This API key is used for the Gemini 2.0 Flash model.
            const apiKey = "AIzaSyC0KNz94IamsjvgpqMkoaRPUCL0yKosSwY"; // e.g., "AIzaSy..."
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
                {microphoneStatus === 'denied' && (
                    <p className="text-red-400 text-center text-sm mb-2">
                        Microphone access is denied. Please enable it in your browser settings to use voice input.
                        (e.g., Chrome: Settings {'>'} Privacy and security {'>'} Site Settings {'>'} Microphone)
                    </p>
                )}
                {microphoneStatus === 'requesting' && (
                    <p className="text-blue-400 text-center text-sm animate-pulse mb-2">
                        Waiting for microphone permission... (Check your browser's prompt)
                    </p>
                )}
                {microphoneStatus === 'unsupported' && (
                    <p className="text-orange-400 text-center text-sm mb-2">
                        Speech Recognition API is not supported by this browser.
                    </p>
                )}
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isRecording} // Disable language selection during recording
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
                        disabled={loading || microphoneStatus === 'unsupported' || isRecording} // Disable text input during recording
                    />
                    <button
                        onClick={toggleVoiceInput}
                        disabled={loading || microphoneStatus === 'unsupported'}
                        className={`p-3 rounded-lg shadow-lg transition-colors duration-300 ${
                            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                        } text-white focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
                            isRecording ? 'focus:ring-red-500' : 'focus:ring-purple-500'
                        }`}
                    >
                        {isRecording ? (
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7.001 7.001 0 006 6.93V17h-2a1 1 0 100 2h4a1 1 0 100-2h-2v-2.07z" clipRule="evenodd"></path></svg>
                                <span>Stop Recording</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                                <span>Start Recording</span>
                            </div>
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

export default Chatbot;