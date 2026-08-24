import React from 'react';
import { Play, Pause, Volume2, Music, X } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export const GlobalPlayerBar = () => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, volume, setVolume } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 z-50 glass-panel rounded-2xl p-3.5 shadow-2xl border border-brand-purple/40 glow-purple flex items-center justify-between gap-3 animate-fade-in">
      {/* Artwork & Info */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 relative">
          {currentTrack.artwork_url ? (
            <img src={currentTrack.artwork_url} alt={currentTrack.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-purple bg-brand-purple/20">
              <Music className="w-5 h-5" />
            </div>
          )}
          {isPlaying && (
            <div className="absolute inset-0 bg-brand-purple/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
            </div>
          )}
        </div>

        <div className="overflow-hidden">
          <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
          <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => playTrack(currentTrack)}
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-purple to-brand-cyan text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>
      </div>
    </div>
  );
};
