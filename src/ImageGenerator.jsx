import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from './App'; // AppContext exported from App.jsx

const ImageGenerator = () => {
    const { setMessage } = useContext(AppContext);
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState([]);
    const audioRef = useRef(null); // Ref for the audio element
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(''); // URL of the selected track

    // Example calming music tracks (replace with actual paths/URLs accessible via HTTP/HTTPS)
    const musicTracks = [
        { name: 'None', url: '' },
        { name: 'Forest Ambience', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }, // Placeholder
        { name: 'Gentle Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },    // Placeholder
        { name: 'Ocean Waves', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },     // Placeholder
    ];

    useEffect(() => {
        // Handle audio playback based on isPlaying state and selectedTrack
        if (audioRef.current) {
            if (isPlaying && selectedTrack) {
                audioRef.current.play().catch(e => {
                    console.error("Audio play failed (user gesture likely needed):", e);
                    setMessage('Failed to play audio. Please click the play button directly.');
                    setIsPlaying(false); // Reset state if play fails
                });
            } else {
                audioRef.current.pause();
                audioRef.current.currentTime = 0; // Reset to start
            }
        }
    }, [isPlaying, selectedTrack]); // Re-run if playing state or track changes

    const togglePlayPause = () => {
        setIsPlaying(prev => !prev);
    };

    const handleTrackChange = (e) => {
        const newTrackUrl = e.target.value;
        setSelectedTrack(newTrackUrl);
        setIsPlaying(false); // Pause and reset when changing track
    };

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
            // === IMPORTANT: REPLACE WITH YOUR ACTUAL GEMINI API KEY ===
            // This API key is used for the Imagen 3.0 model.
            const apiKey = "AIzaSyC0KNz94IamsjvgpqMkoaRPUCL0yKosSwY"; // e.g., "AIzaSy..."
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
                {/* Music Player Controls */}
                <div className="w-full bg-gray-700 p-3 rounded-lg flex items-center justify-between shadow-md">
                    <audio ref={audioRef} src={selectedTrack} loop preload="auto" />
                    <select
                        value={selectedTrack}
                        onChange={handleTrackChange}
                        className="p-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 flex-1 mr-2"
                    >
                        {musicTracks.map((track) => (
                            <option key={track.name} value={track.url}>
                                {track.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={togglePlayPause}
                        disabled={!selectedTrack}
                        className="p-2 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPlaying ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg> // Pause icon
                        ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg> // Play icon
                        )}
                    </button>
                </div>

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

export default ImageGenerator;