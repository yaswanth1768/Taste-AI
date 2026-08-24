import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playTrack = (track) => {
    if (!track) return;
    const audio = audioRef.current;

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch(e => console.log('Audio playback prevented:', e));
        setIsPlaying(true);
      }
    } else {
      audio.pause();
      setCurrentTrack(track);
      audio.src = track.preview_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      audio.volume = volume;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.log('Audio autoplay prevented:', e);
        setIsPlaying(false);
      });
    }
  };

  const pauseTrack = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, pauseTrack, volume, setVolume }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
