import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from './App'; // AppContext exported from App.jsx

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

const JournalEntry = () => {
    const { setMessage } = useContext(AppContext);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState(''); // For voice input
    const [textInput, setTextInput] = useState(''); // For text input
    const [journalEntries, setJournalEntries] = useState([]);
    const recognitionRef = useRef(null); // Ref to hold the SpeechRecognition object
    const mediaStreamRef = useRef(null); // Ref to hold the media stream to stop it later
    const [selectedLanguage, setSelectedLanguage] = useState('en-ZA'); // Default to English (South Africa)
    const [microphoneStatus, setMicrophoneStatus] = useState('idle'); // 'idle', 'requesting', 'granted', 'denied', 'unsupported'

    useEffect(() => {
        // Initialize SpeechRecognition on component mount
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setMicrophoneStatus('unsupported');
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
            setMicrophoneStatus('granted'); // Confirm microphone is active
        };

        recognition.onresult = (event) => {
            const currentTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setTranscript(currentTranscript);
            setMessage('Recording finished. Processing...');
        };

        recognition.onerror = (event) => {
            setMicrophoneStatus('denied'); // Set status to denied on error
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                setMessage('Microphone access denied. Please enable microphone permissions in your browser settings to use voice journaling.');
            } else if (event.error === 'no-speech') {
                setMessage('No speech detected. Please try again.');
            } else if (event.error === 'audio-capture') {
                setMessage('Could not find or access microphone.');
            }
            else {
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
                // This 'transcript' here is the final one from onresult
                setJournalEntries(prev => [...prev, { text: transcript.trim(), timestamp: new Date().toLocaleString(), type: 'voice' }]);
                setMessage('Journal entry saved for this session!');
            } else if (microphoneStatus !== 'denied' && recognitionRef.current && recognitionRef.current.readyState !== 'listening') {
                setMessage('No speech detected.');
            }
            if (microphoneStatus !== 'denied') { // Don't reset if already denied
                setMicrophoneStatus('idle');
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
    }, [selectedLanguage, isRecording, transcript]); // Added transcript to dependency array to ensure onend gets latest

    const toggleRecording = async () => {
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setTranscript(''); // Clear voice transcript before starting new recording
            setTextInput(''); // Clear text input as we're starting voice
            setMicrophoneStatus('requesting'); // Indicate microphone request
            setMessage('Requesting microphone access...');

            try {
                // Request microphone access
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream; // Store the stream to stop it later
                setMessage('Microphone access granted. Starting recording...');
                recognitionRef.current.start();
            } catch (err) {
                console.error("Error accessing microphone:", err);
                setMicrophoneStatus('denied'); // Set status to denied on error
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setMessage('Microphone access denied. Please enable microphone permissions in your browser settings to use voice journaling.');
                } else {
                    setMessage(`Failed to access microphone: ${err.message}`);
                }
                setIsRecording(false); // Ensure recording state is off
            }
        }
    };

    const saveJournalEntry = () => {
        let entryToSave = '';
        let entryType = '';

        // If recording is active, we don't save with this button.
        // The transcript is saved when `recognition.onend` fires.
        if (isRecording) {
            setMessage('Please stop recording before saving.');
            return;
        }

        if (transcript.trim()) { // Prioritize voice transcript if available and not recording
            entryToSave = transcript.trim();
            entryType = 'voice';
        } else if (textInput.trim()) { // Otherwise, use text input
            entryToSave = textInput.trim();
            entryType = 'text';
        } else {
            setMessage('Journal entry cannot be empty.');
            return;
        }

        setJournalEntries(prev => [...prev, { text: entryToSave, timestamp: new Date().toLocaleString(), type: entryType }]);
        setTranscript(''); // Clear voice transcript
        setTextInput(''); // Clear text input
        setMessage('Journal entry saved for this session!');
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
                                <span className="block text-xs text-gray-400 text-right mt-1">
                                    {entry.timestamp} ({entry.type === 'voice' ? 'Voice' : 'Text'})
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center mt-auto gap-3">
                {microphoneStatus === 'denied' && (
                    <p className="text-red-400 text-center text-sm mb-2">
                        Microphone access is denied. Please enable it in your browser settings to use voice journaling.
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
                    disabled={microphoneStatus === 'unsupported' || isRecording}
                >
                    {languageOptions.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>

                <textarea
                    value={isRecording ? currentTranscript : textInput} // Show real-time transcript if recording
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={isRecording ? "Recording... Speak now" : "Type your journal entry here..."}
                    className="w-full h-24 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none resize-none border border-transparent"
                    disabled={isRecording} // Disable typing when recording
                />

                <div className="flex w-full gap-3">
                    <button
                        onClick={toggleRecording}
                        className={`flex-1 py-3 px-6 rounded-lg shadow-lg transition-colors duration-300 transform hover:-translate-y-1 ${
                            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        } text-white font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
                            isRecording ? 'focus:ring-red-500' : 'focus:ring-green-500'
                        }`}
                        disabled={microphoneStatus === 'unsupported'}
                    >
                        {isRecording ? (
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7.001 7.001 0 006 6.93V17h-2a1 1 0 100 2h4a1 1 0 100-2h-2v-2.07z" clipRule="evenodd"></path></svg>
                                <span>Stop Voice</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                                <span>Start Voice</span>
                            </div>
                        )}
                    </button>
                    <button
                        onClick={saveJournalEntry}
                        className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isRecording || (!transcript.trim() && !textInput.trim())} // Disable if recording or both inputs are empty
                    >
                        Save Entry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JournalEntry;