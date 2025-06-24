import React, { useState, useEffect, useRef, useCallback } from 'react';

// Helper function to safely get data from localStorage
const getFromLocalStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return defaultValue;
  }
};

// Helper function to safely set data to localStorage
const setToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage for key "${key}":`, error);
  }
};

// IMPORTANT: Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key
// You can get one from Google AI Studio: https://makersuite.google.com/app/apikey
const GEMINI_API_KEY = 'AIzaSyD5ixU-BJvvlEWqjPEB9L_SVUJg3u5ZbLs';

// IMPORTANT: Replace 'YOUR_IMAGEN_API_KEY_HERE' with your actual API key
// This is often the same key as Gemini, but keep them separate for clarity if needed.
const IMAGEN_API_KEY = 'AIzaSyD5ixU-BJvvlEWqjPEB9L_SVUJg3u5ZbLs';

// Supported Languages for Speech Recognition/Synthesis and AI Interaction
const SUPPORTED_LANGUAGES = [
  { name: 'English (US)', code: 'en-US' },
  { name: 'Spanish (Spain)', code: 'es-ES' },
  { name: 'French (France)', code: 'fr-FR' },
  { name: 'German (Germany)', code: 'de-DE' },
  { name: 'Italian (Italy)', code: 'it-IT' },
  { name: 'Portuguese (Brazil)', code: 'pt-BR' },
  { name: 'Japanese (Japan)', code: 'ja-JP' },
  { name: 'Chinese (Mandarin)', code: 'zh-CN' }, // Simplified Chinese
  { name: 'Korean (Korea)', code: 'ko-KR' },
  { name: 'Hindi (India)', code: 'hi-IN' },
  { name: 'Xhosa (South Africa)', code: 'xh-ZA' },
  { name: 'Zulu (South Africa)', code: 'zu-ZA' },
  { name: 'Tswana (South Africa)', code: 'ts-ZA' }, // Setswana
  { name: 'Shona (Zimbabwe)', code: 'sn-ZW' },
];


// Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'journal', 'moodboard', 'meditate', 'settings'
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('alert'); // 'alert' or 'confirm'
  const [onModalConfirm, setOnModalConfirm] = useState(null);

  // New states for authentication
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getFromLocalStorage('currentUser', null)); // Check if user exists in local storage on load
  const [currentUser, setCurrentUser] = useState(() => getFromLocalStorage('currentUser', null)); // Stores { username, password }

  // State for dynamic background
  const [mainBackgroundClass, setMainBackgroundClass] = useState('bg-gray-800'); // Default background

  // Map tabs to their background classes
  const tabBackgrounds = {
    chat: 'bg-gradient-to-br from-gray-800 to-indigo-900',
    journal: 'bg-gradient-to-br from-gray-800 to-purple-900',
    moodboard: 'bg-gradient-to-br from-gray-800 to-pink-900',
    meditate: 'bg-gradient-to-br from-gray-800 to-red-900',
  };

  // Effect to update background when activeTab changes
  useEffect(() => {
    setMainBackgroundClass(tabBackgrounds[activeTab] || 'bg-gray-800');
  }, [activeTab]);


  // Callback to show custom modal
  const showModal = useCallback((message, type = 'alert', onConfirm = null) => {
    setModalMessage(message);
    setModalType(type);
    setOnModalConfirm(() => onConfirm);
    setModalOpen(true);
  }, []);

  // Callback to close custom modal
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalMessage('');
    setModalType('alert');
    setOnModalConfirm(null);
  }, []);

  // Handle modal confirmation (for 'confirm' type modals)
  const handleModalConfirm = () => {
    if (onModalConfirm) {
      onModalConfirm();
    }
    closeModal();
  };

  // Handle Logout
  const handleLogout = () => {
    showModal(
      "Are you sure you want to log out?",
      "confirm",
      () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setToLocalStorage('currentUser', null); // Clear current user from local storage
        setActiveTab('chat'); // Reset to default tab
        // Optionally, clear all user-specific data from local storage here if desired
        // localStorage.removeItem(`chatHistory_${currentUser.username}`); etc.
      }
    );
  };


  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} setCurrentUser={setCurrentUser} showModal={showModal} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white font-inter flex flex-col md:flex-row rounded-lg shadow-2xl overflow-hidden p-4 m-4 md:m-8">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-gray-800 p-6 rounded-t-lg md:rounded-l-lg md:rounded-tr-none shadow-lg flex md:flex-col items-center justify-center md:justify-start space-x-4 md:space-x-0 md:space-y-6 mb-4 md:mb-0">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-6 hidden md:block">MindMend AI</h1>
        <div className="flex md:flex-col space-x-4 md:space-x-0 md:space-y-4 w-full justify-around md:justify-start">
          {/* Using gradient colors for each NavItem */}
          <NavItem icon="💬" label="Chat" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} activeClasses="bg-gradient-to-r from-teal-600 to-blue-600" inactiveClasses="bg-gray-700 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600" />
          <NavItem icon="📝" label="Journal" isActive={activeTab === 'journal'} onClick={() => setActiveTab('journal')} activeClasses="bg-gradient-to-r from-blue-600 to-indigo-600" inactiveClasses="bg-gray-700 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600" />
          <NavItem icon="🎨" label="Mood Board" isActive={activeTab === 'moodboard'} onClick={() => setActiveTab('moodboard')} activeClasses="bg-gradient-to-r from-purple-600 to-pink-600" inactiveClasses="bg-gray-700 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600" />
          <NavItem icon="🧘" label="Meditate" isActive={activeTab === 'meditate'} onClick={() => setActiveTab('meditate')} activeClasses="bg-gradient-to-r from-pink-600 to-red-600" inactiveClasses="bg-gray-700 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600" />
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 text-red-300 bg-red-800 hover:bg-red-700 hover:text-white mt-auto"
          >
            <span className="text-xl">🚪</span>
            <span className="hidden md:block text-lg font-medium">Logout ({currentUser?.username})</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={`flex-1 p-8 rounded-b-lg md:rounded-r-lg md:rounded-bl-none shadow-lg flex flex-col overflow-auto transition-all duration-500 ease-in-out ${mainBackgroundClass}`}>
        {activeTab === 'chat' && <Chatbot currentUser={currentUser} showModal={showModal} />}
        {activeTab === 'journal' && <VoiceJournal currentUser={currentUser} showModal={showModal} />}
        {activeTab === 'moodboard' && <MoodBoardGenerator currentUser={currentUser} showModal={showModal} />}
        {activeTab === 'meditate' && <MeditationPlayer showModal={showModal} />}
      </main>

      {/* Custom Modal for Messages and Confirmations */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-sm w-full text-center relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold"
            >
              &times;
            </button>
            {modalMessage && (
              <p className="text-lg text-white mb-6">{modalMessage}</p>
            )}
            {modalType === 'confirm' ? (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleModalConfirm}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition duration-300"
                >
                  Yes
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-md transition duration-300"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={closeModal}
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Login Component
const Login = ({ setIsLoggedIn, setCurrentUser, showModal }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // To toggle between login and signup

  const handleAuth = (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!username || !password) {
      showModal("Please enter both username and password.");
      return;
    }

    const users = getFromLocalStorage('users', {}); // Stores { username: { password: 'xyz' } }

    if (isRegistering) {
      // Handle Registration
      if (users[username]) {
        showModal("Username already exists. Please choose a different one or log in.");
      } else {
        users[username] = { password: password };
        setToLocalStorage('users', users);
        const newUser = { username }; // Create the object to store
        setCurrentUser(newUser);
        setIsLoggedIn(true);
        setToLocalStorage('currentUser', newUser); // Explicitly save to localStorage
        showModal("Registration successful! You are now logged in.");
      }
    } else {
      // Handle Login
      if (users[username] && users[username].password === password) {
        const loggedInUser = { username }; // Create the object to store
        setCurrentUser(loggedInUser);
        setIsLoggedIn(true);
        setToLocalStorage('currentUser', loggedInUser); // Explicitly save to localStorage
        showModal("Login successful!");
      } else {
        showModal("Invalid username or password.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white font-inter flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-6">
          {isRegistering ? 'Sign Up' : 'Login'} to MindMend AI
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition duration-300"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <button
          onClick={() => setIsRegistering(prev => !prev)}
          className="mt-6 text-gray-300 hover:text-teal-400 transition duration-300"
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
};


// NavItem Component for Sidebar
const NavItem = ({ icon, label, isActive, onClick, activeClasses, inactiveClasses }) => (
  <button
    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
      isActive ? activeClasses : inactiveClasses
    } text-white shadow-md`} // Added shadow-md for all nav items
    onClick={onClick}
  >
    <span className="text-xl">{icon}</span>
    <span className="hidden md:block text-lg font-medium">{label}</span>
  </button>
);

// --- AI Companion Chatbot Component ---
const Chatbot = ({ currentUser, showModal }) => {
  const chatHistoryKey = `chatHistory_${currentUser.username}`;
  const [messages, setMessages] = useState(() => getFromLocalStorage(chatHistoryKey, []));
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US'); // New state for language
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptionTimeoutRef = useRef(null);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    setToLocalStorage(chatHistoryKey, messages);
  }, [messages]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Voice input functions
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showModal('Your browser does not support Web Speech API. Please use Chrome for this feature.');
      return;
    }

    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = selectedLanguage; // Use selected language

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setInput('');
      console.log('Voice input started for chat...');
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscript + interimTranscript);

      if (transcriptionTimeoutRef.current) {
        clearTimeout(transcriptionTimeoutRef.current);
      }
      transcriptionTimeoutRef.current = setTimeout(() => {
        if (isListening) {
          stopVoiceInput();
          if (input.trim() !== '') {
            sendMessage(finalTranscript + interimTranscript);
          }
        }
      }, 3000);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      showModal(`Speech recognition error: ${event.error}. Please ensure microphone access is granted.`);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      console.log('Voice input ended for chat.');
      if (input.trim() !== '' && !isSending) {
        sendMessage(input.trim());
      }
    };

    recognitionRef.current.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (transcriptionTimeoutRef.current) {
      clearTimeout(transcriptionTimeoutRef.current);
    }
    setIsListening(false);
  };


  const sendMessage = async (messageText = input.trim()) => {
    if (messageText === '') return;

    const userMessage = { role: 'user', text: messageText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      let chatHistoryForGemini = messages.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
      
      // Prepend language instruction to the user's message for model compatibility
      const languageInstruction = `Please respond in ${SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name || 'English'}. `;
      const finalUserMessage = { role: 'user', parts: [{ text: languageInstruction + messageText }] };
      chatHistoryForGemini.pop(); // Remove the last user message added for optimistic update
      chatHistoryForGemini.push(finalUserMessage); // Add the user message with language instruction

      const payload = { contents: chatHistoryForGemini };
      const apiKey = GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const botResponseText = result.candidates && result.candidates.length > 0 &&
                               result.candidates[0].content && result.candidates[0].content.parts &&
                               result.candidates[0].content.parts.length > 0
                               ? result.candidates[0].content.parts[0].text
                               : "Sorry, I couldn't generate a response.";

      const botMessage = { role: 'model', text: botResponseText, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      const errorMessage = { role: 'model', text: `Error: ${error.message}. Please try again.`, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-700 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center text-teal-300">AI Companion Chat</h2>
      <div className="mb-4">
        <label htmlFor="language-select-chat" className="block text-gray-300 text-sm font-medium mb-1">Chat Language:</label>
        <select
          id="language-select-chat"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={isSending || isListening}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">Start a conversation with your AI companion!</div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-600 text-white rounded-bl-none'
              }`}
            >
              <p>{msg.text}</p>
              {msg.timestamp && (
                <span className="text-xs text-gray-300 block mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-gray-600 text-white rounded-bl-none">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center space-x-3">
        <button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            className={`p-3 rounded-lg shadow-md transition duration-300 ${
                isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-purple-500 hover:bg-purple-600'
            }`}
            aria-label={isListening ? "Stop Voice Input" : "Start Voice Input"}
            disabled={isSending}
        >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                {isListening ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.25 7.75A.75.75 0 008.5 8.5v3a.75.75 0 001.5 0v-3a.75.75 0 00-.75-.75z" clipRule="evenodd" />
                ) : (
                    <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                )}
            </svg>
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isSending && sendMessage()}
          placeholder={isListening ? "Listening..." : "Type your message..."}
          className="flex-1 p-3 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={isSending || isListening}
        />
        <button
          onClick={() => sendMessage()}
          className="bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSending || input.trim() === ''}
        >
          {isSending ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Send
            </div>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </div>
  );
};

// --- Voice Journaling Component ---
const VoiceJournal = ({ currentUser, showModal }) => {
  const journalEntriesKey = `journalEntries_${currentUser.username}`;
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [journalEntries, setJournalEntries] = useState(() => getFromLocalStorage(journalEntriesKey, []));
  const [sentimentAnalysis, setSentimentAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US'); // New state for language
  const recognitionRef = useRef(null);
  const transcriptionTimeoutRef = useRef(null);

  // Save journal entries to localStorage whenever they change
  useEffect(() => {
    setToLocalStorage(journalEntriesKey, journalEntries);
  }, [journalEntries]);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showModal('Your browser does not support Web Speech API. Please use Chrome for this feature.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = selectedLanguage; // Use selected language

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setTranscript('');
      setSentimentAnalysis(null);
      console.log('Recording started...');
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interimTranscript);

      // Reset the timeout on new speech input
      if (transcriptionTimeoutRef.current) {
        clearTimeout(transcriptionTimeoutRef.current);
      }
      transcriptionTimeoutRef.current = setTimeout(() => {
        if (isRecording) { // Only stop if still recording
          stopRecording();
        }
      }, 3000); // Stop after 3 seconds of silence
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      showModal(`Speech recognition error: ${event.error}. Please ensure microphone access is granted.`);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      console.log('Recording ended.');
      if (transcript.trim() !== '') {
        analyzeSentiment(transcript.trim());
      }
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (transcriptionTimeoutRef.current) {
      clearTimeout(transcriptionTimeoutRef.current);
    }
    setIsRecording(false);
  };

  const saveJournalEntry = () => {
    if (transcript.trim() === '') return;

    try {
      const journalEntry = {
        id: Date.now(), // Unique ID for the entry
        text: transcript.trim(),
        sentiment: sentimentAnalysis,
        timestamp: new Date().toISOString(),
      };
      setJournalEntries(prev => [journalEntry, ...prev]); // Add new entry to the top
      setTranscript('');
      setSentimentAnalysis(null);
      showModal("Journal entry saved!");
    }
    catch (error) {
      console.error("Error saving journal entry:", error);
      showModal("Failed to save journal entry. Please try again.");
    }
  };

  const analyzeSentiment = async (textToAnalyze) => {
    if (textToAnalyze.trim() === '') {
      setSentimentAnalysis(null);
      return;
    }
    setIsAnalyzing(true);
    setSentimentAnalysis(null);

    try {
      // Instruct Gemini to analyze sentiment for the specific language
      const prompt = `Analyze the sentiment of the following journal entry written in ${SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name || 'English'}. Categorize it as "Positive", "Neutral", or "Negative". Also, provide a very brief, empathetic summary of the underlying emotions or themes in a single sentence, in the same language as the entry.
      Entry: "${textToAnalyze}"
      Format: {"sentiment": "Category", "summary": "Brief summary"}`;

      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = {
          contents: chatHistory,
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "OBJECT",
                  properties: {
                      "sentiment": { "type": "STRING" },
                      "summary": { "type": "STRING" }
                  },
                  "propertyOrdering": ["sentiment", "summary"]
              }
          }
      };
      // Use the global GEMINI_API_KEY
      const apiKey = GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const jsonString = result.candidates && result.candidates.length > 0 &&
                         result.candidates[0].content && result.candidates[0].content.parts &&
                         result.candidates[0].content.parts.length > 0
                         ? result.candidates[0].content.parts[0].text
                         : null;

      if (jsonString) {
        try {
          const parsed = JSON.parse(jsonString);
          setSentimentAnalysis(parsed);
        } catch (jsonError) {
          console.error("Error parsing sentiment JSON:", jsonError);
          setSentimentAnalysis({ sentiment: "N/A", summary: "Could not parse analysis." });
        }
      } else {
        setSentimentAnalysis({ sentiment: "N/A", summary: "No analysis available." });
      }

    } catch (error) {
      console.error("Error analyzing sentiment with Gemini:", error);
      setSentimentAnalysis({ sentiment: "Error", summary: `Failed to analyze: ${error.message}` });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-700 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center text-teal-300">Voice Recorder & Journal</h2>

      <div className="p-4 bg-gray-600 rounded-lg shadow-inner mb-6">
        <div className="mb-4">
          <label htmlFor="language-select-journal" className="block text-gray-300 text-sm font-medium mb-1">Journal Language:</label>
          <select
            id="language-select-journal"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isRecording || isAnalyzing}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-4 rounded-full shadow-lg transition duration-300 ease-in-out transform ${
            isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-green-500 hover:bg-green-600'
          }`}
          aria-label={isRecording ? "Stop Recording" : "Start Recording"}
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            {isRecording ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.25 7.75A.75.75 0 008.5 8.5v3a.75.75 0 001.5 0v-3a.75.75 0 00-.75-.75z" clipRule="evenodd" /> // Stop icon
            ) : (
              <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /> // Microphone icon
            )}
          </svg>
        </button>
        <p className="mt-3 text-lg text-gray-300">{isRecording ? 'Recording...' : 'Click to record your thoughts'}</p>
        <div className="w-full h-px bg-gray-500 my-4"></div>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your recording will be transcribed here, or you can type directly..."
          className="w-full p-3 h-32 rounded-lg bg-gray-800 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
        ></textarea>
        {sentimentAnalysis && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg w-full text-center">
            <h3 className="text-lg font-semibold text-purple-300">Sentiment Analysis:</h3>
            <p className={`text-xl font-bold ${
              sentimentAnalysis.sentiment === "Positive" ? "text-green-400" :
              sentimentAnalysis.sentiment === "Negative" ? "text-red-400" :
              "text-yellow-400"
            }`}>
              {sentimentAnalysis.sentiment}
            </p>
            <p className="text-gray-300 italic">{sentimentAnalysis.summary}</p>
          </div>
        )}
        {isAnalyzing && (
          <div className="mt-4 flex items-center text-teal-300">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-300 mr-2"></div>
            Analyzing sentiment...
          </div>
        )}
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => analyzeSentiment(transcript)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!transcript.trim() || isAnalyzing || isRecording}
          >
            Analyze Text
          </button>
          <button
            onClick={saveJournalEntry}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!transcript.trim() || isRecording}
          >
            Save Entry
          </button>
        </div>
      </div>

      {/* Journal History */}
      <h3 className="text-xl font-semibold mb-3 text-teal-300">Past Entries</h3>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {journalEntries.length === 0 ? (
          <p className="text-center text-gray-400 mt-4">No journal entries yet.</p>
        ) : (
          journalEntries.map((entry) => (
            <div key={entry.id} className="mb-4 p-4 bg-gray-600 rounded-lg shadow-md">
              <p className="text-gray-200 text-sm mb-2">{new Date(entry.timestamp).toLocaleString()}</p>
              <p className="text-white mb-2">{entry.text}</p>
              {entry.sentiment && (
                <div className="text-sm">
                  <span className={`font-semibold ${
                    entry.sentiment.sentiment === "Positive" ? "text-green-300" :
                    entry.sentiment.sentiment === "Negative" ? "text-red-300" :
                    "text-yellow-300"
                  }`}>
                    Sentiment: {entry.sentiment.sentiment}
                  </span>
                  <p className="text-gray-300 italic">{entry.sentiment.summary}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Mood Board Generator Component ---
const MoodBoardGenerator = ({ currentUser, showModal }) => {
  const moodBoardsKey = `moodBoards_${currentUser.username}`;
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedMoodBoards, setSavedMoodBoards] = useState(() => getFromLocalStorage(moodBoardsKey, []));
  const [selectedImage, setSelectedImage] = useState(''); // For modal image view

  // Save mood boards to localStorage whenever they change
  useEffect(() => {
    setToLocalStorage(moodBoardsKey, savedMoodBoards);
  }, [savedMoodBoards]);

  const openImageModal = (imgSrc) => {
    setSelectedImage(imgSrc);
    showModal(<img src={imgSrc} alt="Enlarged Mood Board" className="max-w-full h-auto rounded-lg mb-4" />, 'alert'); // Using alert modal to display image
  };


  const generateImage = async () => {
    if (prompt.trim() === '') {
      showModal("Please enter a description for your mood board image.");
      return;
    }
    setIsGenerating(true);
    setImageUrl(''); // Clear previous image

    try {
      const payload = { instances: { prompt: prompt.trim() }, parameters: { "sampleCount": 1 } };
      // Use the global IMAGEN_API_KEY defined at the top of the file
      const apiKey = IMAGEN_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
        const generatedImageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        setImageUrl(generatedImageUrl);
      } else {
        showModal("Failed to generate image. No valid image data received.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      showModal(`Error generating image: ${error.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveMoodBoard = () => {
    if (!imageUrl) {
      showModal("No image to save. Generate one first!");
      return;
    }
    try {
      const moodBoardEntry = {
        id: Date.now(), // Unique ID for the entry
        prompt: prompt.trim(),
        imageUrl: imageUrl,
        timestamp: new Date().toISOString(),
      };
      setSavedMoodBoards(prev => [moodBoardEntry, ...prev]); // Add new entry to the top
      setPrompt('');
      setImageUrl('');
      showModal("Mood board saved successfully!");
    } catch (error) {
      console.error("Error saving mood board:", error);
      showModal("Failed to save mood board. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-700 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center text-teal-300">AI Mood Board Creator</h2>

      {/* Image Generation Controls */}
      <div className="flex flex-col items-center mb-6 p-4 bg-gray-600 rounded-lg shadow-inner">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the mood or image you want to generate (e.g., 'calm forest, serene lake, sunrise')"
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
          disabled={isGenerating}
        />
        <button
          onClick={generateImage}
          className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full md:w-auto"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Generating...
            </>
          ) : (
            'Generate Mood Image'
          )}
        </button>

        {imageUrl && (
          <div className="mt-6 w-full flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-3 text-purple-300">Generated Image:</h3>
            <img
              src={imageUrl}
              alt="Generated Mood Board"
              className="max-w-full h-auto rounded-lg shadow-xl border-2 border-gray-500 object-contain max-h-80"
            />
            <button
              onClick={saveMoodBoard}
              className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition duration-300"
            >
              Save Mood Board
            </button>
          </div>
        )}
      </div>

      {/* Saved Mood Boards */}
      <h3 className="text-xl font-semibold mb-3 text-teal-300">Your Saved Mood Boards</h3>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedMoodBoards.length === 0 ? (
          <p className="text-center text-gray-400 col-span-full mt-4">No mood boards saved yet.</p>
        ) : (
          savedMoodBoards.map((board) => (
            <div key={board.id} className="bg-gray-600 rounded-lg shadow-md p-3 flex flex-col items-center">
              <img
                src={board.imageUrl}
                alt={board.prompt}
                className="w-full h-32 object-cover rounded-lg mb-2 cursor-pointer border border-gray-500"
                onClick={() => openImageModal(board.imageUrl)}
              />
              <p className="text-sm text-gray-200 text-center mb-1 line-clamp-2">{board.prompt}</p>
              <p className="text-xs text-gray-400">{new Date(board.timestamp).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Guided Meditation Player Component ---
const MeditationPlayer = ({ showModal }) => {
  const [meditationText, setMeditationText] = useState("Close your eyes gently. Take a deep breath in through your nose, feeling your belly rise. Exhale slowly through your mouth, letting go of any tension. Notice the stillness within you. You are safe. You are calm. You are at peace.");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthesisRef = useRef(null);
  const utteranceRef = useRef(null);
  const [voiceList, setVoiceList] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US'); // New state for language
  const [voicesReady, setVoicesReady] = useState(false); // New state to track if voices have been populated

  // Initialize SpeechSynthesis and get voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
      const populateVoices = () => {
        const allVoices = synthesisRef.current.getVoices();
        console.log("All available voices:", allVoices); // Log all voices
        
        // Filter voices by selected language, trying both exact match and locale prefix
        const filteredVoices = allVoices.filter(voice => 
          voice.lang === selectedLanguage || voice.lang.startsWith(selectedLanguage.substring(0, 2))
        );
        setVoiceList(filteredVoices);
        setVoicesReady(true); // Mark voices as ready

        // Attempt to set a default voice based on selected language and common providers
        const defaultVoice = filteredVoices.find(voice => 
          voice.lang === selectedLanguage && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        ) || filteredVoices.find(voice => 
          voice.lang.startsWith(selectedLanguage.substring(0, 2))
        );
        
        if (defaultVoice) {
          setSelectedVoice(defaultVoice.name);
        } else if (filteredVoices.length > 0) {
          setSelectedVoice(filteredVoices[0].name); // Fallback to first available filtered voice
        } else {
            setSelectedVoice(null); // No voice for this language
            // Only show modal if there are *no* voices at all, to avoid spamming
            if (allVoices.length > 0) { // Check if any voices exist, but none for this language
                showModal(`No specific speech synthesis voices found for "${SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name || selectedLanguage}". You might need to install language packs for your operating system or try a different browser.`, 'alert');
            } else { // No voices at all
                 showModal("No speech synthesis voices found on your system. Please ensure voices are installed and your browser supports Text-to-Speech.", 'alert');
            }
        }
      };

      // Ensure voices are loaded. Sometimes onvoiceschanged isn't triggered immediately.
      // Call populateVoices directly and also listen for changes.
      populateVoices(); 
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = populateVoices;
      }
    } else {
      showModal("Text-to-speech not supported in this browser.");
    }

    // Clean up
    return () => {
      if (synthesisRef.current && utteranceRef.current) {
        synthesisRef.current.cancel();
      }
      if (synthesisRef.current && synthesisRef.current.onvoiceschanged) {
          synthesisRef.current.onvoiceschanged = null;
      }
    };
  }, [showModal, selectedLanguage]); // Re-run when selectedLanguage changes

  const speakText = () => {
    if (!synthesisRef.current || !meditationText || !selectedVoice) {
        showModal("Please select a voice and ensure there is meditation text to speak.", 'alert');
        return;
    }

    if (synthesisRef.current.speaking) {
      synthesisRef.current.cancel(); // Stop current speech if any
    }

    const utterance = new SpeechSynthesisUtterance(meditationText);
    utteranceRef.current = utterance; // Store reference to current utterance

    const voice = voiceList.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang; // Set utterance language to match the voice
    } else {
        utterance.lang = selectedLanguage; // Fallback to selected language if no specific voice
    }
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setIsSpeaking(false);
      showModal(`Text-to-speech error: ${event.error}. Ensure a voice is available for the selected language.`, 'alert');
    };

    synthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthesisRef.current && synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const generateMeditationText = async () => {
    setIsGeneratingText(true);
    setMeditationText('');
    stopSpeaking(); // Stop any ongoing speech

    try {
      // Instruct Gemini to generate meditation text in the selected language
      const prompt = `Generate a short, calming guided meditation script (around 50-100 words) focusing on relaxation and presence. Write it in ${SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name || 'English'}.`;
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      // Use the global GEMINI_API_KEY
      const apiKey = GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const generatedText = result.candidates && result.candidates.length > 0 &&
                            result.candidates[0].content && result.candidates[0].content.parts &&
                            result.candidates[0].content.parts.length > 0
                            ? result.candidates[0].content.parts[0].text
                            : "Failed to generate new meditation text.";
      setMeditationText(generatedText);
    } catch (error) {
      console.error("Error generating meditation text:", error);
      setMeditationText("Failed to generate new meditation text. Please try again.");
    } finally {
      setIsGeneratingText(false);
    }
  };


  return (
    <div className="flex flex-col h-full bg-gray-700 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center text-teal-300">Guided Meditations</h2>

      <div className="p-4 bg-gray-600 rounded-lg shadow-inner mb-6">
        <div className="mb-4">
          <label htmlFor="language-select-meditation" className="block text-gray-300 text-sm font-medium mb-1">Meditation Language:</label>
          <select
            id="language-select-meditation"
            value={selectedLanguage}
            onChange={(e) => { setSelectedLanguage(e.target.value); setVoicesReady(false); setVoiceList([]); }} // Reset voicesReady and voiceList on language change
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isSpeaking || isGeneratingText}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <h3 className="text-xl font-semibold mb-3 text-purple-300">Meditation Script:</h3>
        <textarea
          value={meditationText}
          onChange={(e) => setMeditationText(e.target.value)}
          placeholder="Enter your meditation script here..."
          className="w-full p-3 h-40 rounded-lg bg-gray-800 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y mb-4"
          disabled={isSpeaking || isGeneratingText}
        ></textarea>

        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-4">
          <div className="flex-1">
            <label htmlFor="voice-select" className="block text-gray-300 text-sm font-medium mb-1">Select Voice:</label>
            <select
              id="voice-select"
              value={selectedVoice || ''}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isSpeaking || isGeneratingText}
            >
              {!voicesReady && <option value="">Loading voices...</option>}
              {voicesReady && voiceList.length === 0 && <option value="">No voices found (try another language)</option>}
              {voiceList.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang}) {voice.default ? ' (Default)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="rate-input" className="block text-gray-300 text-sm font-medium mb-1">Speech Rate: {rate.toFixed(1)}</label>
            <input
              id="rate-input"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isSpeaking || isGeneratingText}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="pitch-input" className="block text-gray-300 text-sm font-medium mb-1">Pitch: {pitch.toFixed(1)}</label>
            <input
              id="pitch-input"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isSpeaking || isGeneratingText}
            />
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={generateMeditationText}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isSpeaking || isGeneratingText}
          >
            {isGeneratingText ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              'Generate New Script'
            )}
          </button>
          <button
            onClick={isSpeaking ? stopSpeaking : speakText}
            className={`px-6 py-3 rounded-lg shadow-md transition duration-300 ${
              isSpeaking ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-500 hover:bg-teal-600'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!meditationText || isGeneratingText || !selectedVoice} // Disable if no voice is selected
          >
            {isSpeaking ? 'Stop Meditation' : 'Start Meditation'}
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Take a moment to relax and find your inner peace.</p>
        <p>Focus on your breath, listen to the words, and let go of any distractions.</p>
      </div>
    </div>
  );
};

export default App;
