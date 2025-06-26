// src/MeditationSection.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import * as Tone from 'tone';
import { AppContext } from './App';
import { useAudioContextStatus } from './AudioContextInitializer';

const MeditationSection = () => {
    const { setMessage } = useContext(AppContext);
    const audioReady = useAudioContextStatus();

    // Meditation Timer States
    const [meditationDuration, setMeditationDuration] = useState(5); // Default to 5 minutes
    const [timeRemaining, setTimeRemaining] = useState(5 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    // Sound States
    const [selectedSoundType, setSelectedSoundType] = useState('drone');
    const [isSoundPlaying, setIsSoundPlaying] = useState(false);

    // Tone.js Refs
    const currentSynthRef = useRef(null);
    const noiseFilterRef = useRef(null);
    const reverbRef = useRef(null);
    const isInitializedRef = useRef(false);

    // Update time remaining when duration changes
    useEffect(() => {
        if (!isRunning) {
            setTimeRemaining(meditationDuration * 60);
        }
    }, [meditationDuration, isRunning]);

    // Initialize audio resources
    useEffect(() => {
        if (!audioReady) return;

        const initializeAudio = async () => {
            try {
                // Ensure Tone.js context is started
                if (Tone.context.state !== 'running') {
                    await Tone.start();
                }

                // Initialize reverb once
                if (!reverbRef.current) {
                    reverbRef.current = new Tone.Reverb({
                        decay: 10,
                        preDelay: 0.01,
                        wet: 0.7
                    }).toDestination();
                    await reverbRef.current.generate();
                }

                // Clean up previous sound instances
                if (currentSynthRef.current) {
                    currentSynthRef.current.dispose();
                    currentSynthRef.current = null;
                }
                if (noiseFilterRef.current) {
                    noiseFilterRef.current.dispose();
                    noiseFilterRef.current = null;
                }

                // Initialize sound based on selected type
                if (selectedSoundType === 'drone') {
                    currentSynthRef.current = new Tone.PolySynth(Tone.AMSynth, {
                        oscillator: { type: 'sine' },
                        envelope: {
                            attack: 2,
                            decay: 0.1,
                            sustain: 1,
                            release: 2
                        },
                        volume: -15
                    }).connect(reverbRef.current);
                } else if (selectedSoundType === 'rain') {
                    noiseFilterRef.current = new Tone.Filter(800, 'lowpass').connect(reverbRef.current);
                    currentSynthRef.current = new Tone.Noise({
                        type: 'white',
                        volume: -20
                    }).connect(noiseFilterRef.current);
                }

                isInitializedRef.current = true;
                console.log(`Audio initialized for ${selectedSoundType}`);
            } catch (error) {
                console.error('Error initializing audio:', error);
                setMessage(`Audio initialization error: ${error.message}`);
            }
        };

        initializeAudio();

        return () => {
            // Cleanup on unmount or sound type change
            if (currentSynthRef.current) {
                try {
                    if (isSoundPlaying) {
                        if (selectedSoundType === 'drone') {
                            currentSynthRef.current.releaseAll();
                        } else {
                            currentSynthRef.current.stop();
                        }
                    }
                    currentSynthRef.current.dispose();
                } catch (error) {
                    console.error('Error disposing synth:', error);
                }
                currentSynthRef.current = null;
            }
            if (noiseFilterRef.current) {
                try {
                    noiseFilterRef.current.dispose();
                } catch (error) {
                    console.error('Error disposing filter:', error);
                }
                noiseFilterRef.current = null;
            }
        };
    }, [audioReady, selectedSoundType]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (reverbRef.current) {
                try {
                    reverbRef.current.dispose();
                } catch (error) {
                    console.error('Error disposing reverb:', error);
                }
            }
        };
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const startMeditation = async () => {
        if (!audioReady) {
            setMessage('Audio context not ready. Click anywhere on the page first.');
            return;
        }
        if (isRunning) return;

        try {
            // Ensure audio context is running
            if (Tone.context.state !== 'running') {
                await Tone.start();
            }

            // Start calming sound
            await startCalmingSound();
            
            setIsRunning(true);
            setMessage('Meditation timer started!');

            timerRef.current = setInterval(() => {
                setTimeRemaining((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current);
                        setIsRunning(false);
                        stopCalmingSound();
                        setMessage('Meditation complete! 🧘‍♀️');
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } catch (error) {
            console.error('Error starting meditation:', error);
            setMessage(`Error starting meditation: ${error.message}`);
        }
    };

    const pauseMeditation = () => {
        if (!isRunning) return;
        clearInterval(timerRef.current);
        setIsRunning(false);
        stopCalmingSound();
        setMessage('Meditation paused.');
    };

    const resetMeditation = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsRunning(false);
        stopCalmingSound();
        setTimeRemaining(meditationDuration * 60);
        setMessage('Meditation reset.');
    };

    const startCalmingSound = async () => {
        if (!audioReady || !currentSynthRef.current || isSoundPlaying) {
            if (!audioReady) setMessage('Audio not ready');
            if (!currentSynthRef.current) setMessage('Sound not initialized');
            return;
        }

        try {
            if (Tone.context.state !== 'running') {
                await Tone.start();
            }

            if (selectedSoundType === 'drone') {
                currentSynthRef.current.triggerAttack(['C3', 'E3', 'G3', 'C4']);
            } else if (selectedSoundType === 'rain') {
                currentSynthRef.current.start();
            }
            
            setIsSoundPlaying(true);
            if (!isRunning) { // Only show message if not starting meditation
                setMessage(`Calming sound (${selectedSoundType}) started.`);
            }
        } catch (error) {
            console.error('Error starting sound:', error);
            setMessage(`Error starting sound: ${error.message}`);
            setIsSoundPlaying(false);
        }
    };

    const stopCalmingSound = () => {
        if (!isSoundPlaying || !currentSynthRef.current) return;

        try {
            if (selectedSoundType === 'drone') {
                currentSynthRef.current.releaseAll();
            } else if (selectedSoundType === 'rain') {
                currentSynthRef.current.stop();
            }
            
            setIsSoundPlaying(false);
            if (!isRunning) { // Only show message if not during meditation
                setMessage('Calming sound stopped.');
            }
        } catch (error) {
            console.error('Error stopping sound:', error);
            setMessage(`Error stopping sound: ${error.message}`);
        }
    };

    const handleSoundTypeChange = (e) => {
        const newSoundType = e.target.value;
        
        // Stop current sound if playing
        if (isSoundPlaying) {
            stopCalmingSound();
        }
        
        setSelectedSoundType(newSoundType);
        setMessage(`Sound type changed to ${newSoundType}`);
    };

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto text-center border border-gray-700">
            <h2 className="text-3xl font-extrabold text-white mb-6">Meditation Space</h2>

            {/* Audio Status Indicator */}
            <div className="mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    audioReady ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                        audioReady ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    {audioReady ? 'Audio Ready' : 'Audio Not Ready'}
                </div>
            </div>

            {/* Sound Type Selection */}
            <div className="mb-6">
                <label htmlFor="sound-type" className="block text-gray-300 text-lg font-semibold mb-2">
                    Select Calming Sound:
                </label>
                <select
                    id="sound-type"
                    value={selectedSoundType}
                    onChange={handleSoundTypeChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isRunning}
                >
                    <option value="drone">Soothing Drone</option>
                    <option value="rain">Gentle Rain</option>
                </select>
            </div>

            {/* Timer Display */}
            <div className="mb-8">
                <p className="text-6xl font-mono text-blue-400 mb-4">{formatTime(timeRemaining)}</p>
                <label htmlFor="meditation-duration" className="block text-gray-300 text-md mb-2">
                    Meditation Duration (minutes):
                </label>
                <input
                    type="number"
                    id="meditation-duration"
                    min="1"
                    max="60"
                    value={meditationDuration}
                    onChange={(e) => {
                        const newDuration = Math.min(60, Math.max(1, parseInt(e.target.value) || 5));
                        setMeditationDuration(newDuration);
                    }}
                    className="w-24 p-2 bg-gray-700 text-white rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isRunning}
                />
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center space-x-4 mb-6">
                {!isRunning ? (
                    <button
                        onClick={startMeditation}
                        className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!audioReady}
                    >
                        Start Meditation
                    </button>
                ) : (
                    <button
                        onClick={pauseMeditation}
                        className="bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-yellow-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75"
                    >
                        Pause Meditation
                    </button>
                )}
                <button
                    onClick={resetMeditation}
                    disabled={!audioReady || (timeRemaining === meditationDuration * 60 && !isRunning)}
                    className="bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Reset
                </button>
            </div>

            {/* Calming Sound Controls */}
            <div className="flex justify-center space-x-4 mt-6">
                {!isSoundPlaying ? (
                    <button
                        onClick={startCalmingSound}
                        className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isRunning || !audioReady}
                    >
                        Play Calming Sound
                    </button>
                ) : (
                    <button
                        onClick={stopCalmingSound}
                        className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-cyan-700 transition-colors duration-300"
                        disabled={isRunning}
                    >
                        Stop Calming Sound
                    </button>
                )}
            </div>

            {/* Sound Status */}
            {isSoundPlaying && (
                <div className="mt-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900 text-blue-300">
                        <div className="w-2 h-2 rounded-full mr-2 bg-blue-400 animate-pulse"></div>
                        Playing {selectedSoundType === 'drone' ? 'Soothing Drone' : 'Gentle Rain'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeditationSection;