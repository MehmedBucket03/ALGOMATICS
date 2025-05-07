import React, { useState, useEffect, useRef } from 'react';
import './AudioPlayer.css';

const AudioPlayer = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [errorMessage, setErrorMessage] = useState('');
    const [audioLoaded, setAudioLoaded] = useState(false);

    // Try different audio sources if one doesn't work
    const audioSources = [
        "/music/Lofi.mp3",           // From public/music folder
        "/assets/music/Lofi.mp3",    // Alternative path
        "/Lofi.mp3"                  // Root of public folder
    ];

    const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

    // Handle loading and errors
    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        audioElement.volume = volume;

        const handleError = () => {
            console.error('Audio error with source:', audioSources[currentSourceIndex]);

            // Try next source if available
            if (currentSourceIndex < audioSources.length - 1) {
                setCurrentSourceIndex(currentSourceIndex + 1);
                setErrorMessage(`Trying alternative audio source...`);
            } else {
                setErrorMessage('Could not play audio. Please check file path and format.');
            }

            setIsPlaying(false);
        };

        const handleCanPlay = () => {
            console.log('Audio can play now');
            setAudioLoaded(true);
            setErrorMessage('');
        };

        audioElement.addEventListener('error', handleError);
        audioElement.addEventListener('canplay', handleCanPlay);

        return () => {
            audioElement.removeEventListener('error', handleError);
            audioElement.removeEventListener('canplay', handleCanPlay);
            audioElement.pause();
        };
    }, [currentSourceIndex, volume]);

    // Handle play/pause
    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement || !audioLoaded) return;

        if (isPlaying) {
            const playPromise = audioElement.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Play failed:', error);
                    setErrorMessage('Browser blocked autoplay. Please click play again.');
                    setIsPlaying(false);
                });
            }
        } else {
            audioElement.pause();
        }
    }, [isPlaying, audioLoaded]);

    const togglePlay = () => {
        if (audioLoaded) {
            setIsPlaying(!isPlaying);
        } else {
            // If audio isn't loaded, try to load it first
            audioRef.current.load();
            setErrorMessage('Loading audio...');
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);

        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    return (
        <div className="audio-player">
            <audio
                ref={audioRef}
                src={audioSources[currentSourceIndex]}
                loop
                preload="auto"
            />

            <div className="audio-controls">
                <button
                    onClick={togglePlay}
                    className="play-button"
                >
                    {isPlaying ? '🔇 Pause' : '🔊 Play'}
                </button>

                <div className="volume-slider">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="slider"
                    />
                </div>

                {errorMessage && (
                    <div className="error-message">
                        {errorMessage}
                    </div>
                )}

                <div className="audio-source">
                    Playing: Source {currentSourceIndex + 1}/{audioSources.length}
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;