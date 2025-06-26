// VoiceJournal.jsx
import { useState, useRef } from 'react';

export default function VoiceJournal() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const handleRecord = async () => {
    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        
        mediaRecorder.current.ondataavailable = (e) => {
          audioChunks.current.push(e.data);
        };
        
        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          // Here you would send to your backend for processing
          setTranscript("Processing your recording...");
          audioChunks.current = [];
        };
        
        mediaRecorder.current.start();
        setIsRecording(true);
      } else {
        mediaRecorder.current.stop();
        setIsRecording(false);
      }
    } catch (error) {
      console.error("Recording failed:", error);
      setTranscript("Error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-2xl shadow-inner-xl border border-gray-700 p-4">
      {/* Your existing HTML structure */}
      <button 
        onClick={handleRecord}
        className={`w-full py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
          isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        } text-white font-semibold focus:outline-none focus:ring-4 focus:ring-opacity-75`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
}