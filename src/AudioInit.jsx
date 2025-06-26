// src/AudioInit.jsx
import React, { useEffect, createContext, useContext, useState } from 'react';
import * as Tone from 'tone';

// 1. Define the AudioContextStatus context
const AudioContextStatus = createContext(false); // Default value is false (audio not ready)

// 2. Export a hook to easily consume the audio readiness status
export const useAudioContextStatus = () => useContext(AudioContextStatus);

// 3. Define the AudioContextInitializer component
// This component should be a wrapper at the very root of your application
export function AudioContextInitializer({ children }) {
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    const initAudio = async () => {
      try {
        await Tone.start();
        console.log('Audio context ready');
        setAudioReady(true);
      } catch (err) {
        console.error('Audio context initialization failed:', err);
        setAudioReady(false);
      }
    };

    // Event listener to start audio on the first user interaction
    const handleFirstClick = () => {
      initAudio();
      document.removeEventListener('click', handleFirstClick); // Remove listener after first click
    };

    document.addEventListener('click', handleFirstClick);

    // Check if audio context is already running (e.g., after hot reload in dev)
    if (Tone.context.state === 'running') {
      setAudioReady(true);
    }

    // Cleanup function for the event listener
    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    // 4. Provide the audioReady status to its children
    <AudioContextStatus.Provider value={audioReady}>
      {children}
    </AudioContextStatus.Provider>
  );
}

// Export AudioContextInitializer as the default export
export default AudioContextInitializer;