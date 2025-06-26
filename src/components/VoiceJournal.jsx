// VoiceJournal.jsx
import { useState, useRef, useContext } from 'react';
import { AppContext } from './App';

export default function VoiceJournal() {
  const { setMessage } = useContext(AppContext);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const [microphoneStatus, setMicrophoneStatus] = useState('idle'); // 'idle', 'requesting', 'granted', 'denied'

  const handleRecord = async () => {
    try {
      if (!isRecording) {
        setMicrophoneStatus('requesting');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        
        mediaRecorder.current.ondataavailable = (e) => {
          audioChunks.current.push(e.data);
        };
        
        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          // Here you would send to your backend for processing
          setTranscript("Processing your recording...");
          setJournalEntries(prev => [...prev, { 
            text: transcript || "Voice recording", 
            timestamp: new Date().toLocaleString() 
          }]);
          audioChunks.current = [];
        };
        
        mediaRecorder.current.start();
        setIsRecording(true);
        setMicrophoneStatus('granted');
        setMessage('Recording started...');
      } else {
        mediaRecorder.current.stop();
        setIsRecording(false);
        setMessage('Recording stopped. Processing...');
      }
    } catch (error) {
      console.error("Recording failed:", error);
      setMicrophoneStatus('denied');
      if (error.name === 'NotAllowedError') {
        setMessage('Microphone access denied. Please enable permissions.');
      } else {
        setMessage(`Recording error: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-2xl shadow-inner-xl border border-gray-700 p-4">
      <div className="mb-4">
        <select className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="en-US">English (US)</option>
          <option value="en-ZA">English (South Africa)</option>
          {/* Add other language options */}
        </select>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 bg-gray-800 rounded-lg p-3 border border-gray-700">
        {journalEntries.length === 0 ? (
          <p className="text-gray-400 text-center italic">Your journal entries will appear here.</p>
        ) : (
          journalEntries.map((entry, index) => (
            <div key={index} className="mb-3 p-2 bg-gray-700 rounded">
              <p className="text-white">{entry.text}</p>
              <p className="text-gray-400 text-xs">{entry.timestamp}</p>
            </div>
          ))
        )}
      </div>
      
      <textarea
        value={transcript}
        readOnly
        placeholder="Speak to see your transcript here..."
        className="w-full h-28 p-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 mb-4"
      />
      
      {microphoneStatus === 'denied' && (
        <p className="text-red-400 text-sm mb-2">
          Microphone access denied. Please enable permissions in browser settings.
        </p>
      )}
      
      <button 
        onClick={handleRecord}
        className={`w-full py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
          isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        } text-white font-semibold focus:outline-none focus:ring-4 focus:ring-opacity-75`}
      >
        {isRecording ? (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7.001 7.001 0 006 6.93V17h-2a1 1 0 100 2h4a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
            </svg>
            Stop Recording
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Start Recording
          </div>
        )}
      </button>
    </div>
  );
}