// src/AudioContextInitializer.jsx (Fixed Version)
import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Tone from 'tone';

const AudioContextStatus = createContext(false);
export const useAudioContextStatus = () => useContext(AudioContextStatus);

export function AudioContextInitializer({ children }) {
    const [audioReady, setAudioReady] = useState(false);
    const [userInteracted, setUserInteracted] = useState(false);

    useEffect(() => {
        let isInitializing = false;

        const initAudio = async () => {
            if (isInitializing) return;
            isInitializing = true;

            try {
                console.log('Attempting to start audio context...');
                
                // Check if context is already running
                if (Tone.context.state === 'running') {
                    console.log('Audio context already running');
                    setAudioReady(true);
                    isInitializing = false;
                    return;
                }

                // Start the audio context
                await Tone.start();
                console.log('Audio context started successfully');
                setAudioReady(true);
            } catch (err) {
                console.error('Failed to start audio context:', err);
                setAudioReady(false);
            } finally {
                isInitializing = false;
            }
        };

        // Handle first user interaction
        const handleFirstInteraction = async (event) => {
            console.log('User interaction detected:', event.type);
            setUserInteracted(true);
            await initAudio();
            
            // Remove all interaction listeners after first successful init
            if (Tone.context.state === 'running') {
                document.removeEventListener('click', handleFirstInteraction);
                document.removeEventListener('touchstart', handleFirstInteraction);
                document.removeEventListener('keydown', handleFirstInteraction);
            }
        };

        // Check if audio context is already running (dev hot reload case)
        if (Tone.context.state === 'running') {
            console.log('Audio context already running on mount');
            setAudioReady(true);
            setUserInteracted(true);
        } else {
            // Add multiple event listeners for different interaction types
            document.addEventListener('click', handleFirstInteraction, { once: false });
            document.addEventListener('touchstart', handleFirstInteraction, { once: false });
            document.addEventListener('keydown', handleFirstInteraction, { once: false });
        }

        // Monitor audio context state changes
        const handleStateChange = () => {
            const state = Tone.context.state;
            console.log('Audio context state changed to:', state);
            setAudioReady(state === 'running');
        };

        // Add state change listener if available
        if (Tone.context.addEventListener) {
            Tone.context.addEventListener('statechange', handleStateChange);
        }

        return () => {
            // Cleanup event listeners
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            
            if (Tone.context.removeEventListener) {
                Tone.context.removeEventListener('statechange', handleStateChange);
            }
        };
    }, []);

    // Provide a method to manually retry audio initialization
    const retryAudioInit = async () => {
        try {
            await Tone.start();
            setAudioReady(true);
            setUserInteracted(true);
            console.log('Manual audio init successful');
        } catch (error) {
            console.error('Manual audio init failed:', error);
            setAudioReady(false);
        }
    };

    return (
        <AudioContextStatus.Provider value={audioReady}>
            {children}
            {/* Audio initialization prompt */}
            {!audioReady && !userInteracted && (
                <div className="fixed top-4 right-4 bg-yellow-600 text-white p-3 rounded-lg shadow-lg z-50 max-w-sm">
                    <p className="text-sm mb-2">🎵 Click anywhere to enable audio</p>
                    <button 
                        onClick={retryAudioInit}
                        className="bg-yellow-700 hover:bg-yellow-800 px-3 py-1 rounded text-xs transition-colors"
                    >
                        Enable Audio
                    </button>
                </div>
            )}
            {!audioReady && userInteracted && (
                <div className="fixed top-4 right-4 bg-red-600 text-white p-3 rounded-lg shadow-lg z-50 max-w-sm">
                    <p className="text-sm mb-2">⚠️ Audio failed to initialize</p>
                    <button 
                        onClick={retryAudioInit}
                        className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-xs transition-colors"
                    >
                        Retry Audio
                    </button>
                </div>
            )}
        </AudioContextStatus.Provider>
    );
}