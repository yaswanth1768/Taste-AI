import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, ThumbsUp, ThumbsDown, Sparkles, Activity, Radio } from 'lucide-react';
import { Badge } from '../common/Badge';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import { feedbackService } from '../../services/feedbackService';

export const TrackCard = ({ track, onFavoriteToggle }) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    playTrack(track);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    try {
      await feedbackService.recordFeedback({
        item_id: track.id,
        item_type: 'music',
        action: liked ? 'click' : 'like',
        rating: 5.0
      });
      setLiked(!liked);
      if (disliked) setDisliked(false);
    } catch (err) {
      console.error('Feedback failed:', err);
    }
  };

  const handleDislike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    try {
      await feedbackService.recordFeedback({
        item_id: track.id,
        item_type: 'music',
        action: disliked ? 'click' : 'dislike',
        rating: 1.0
      });
      setDisliked(!disliked);
      if (liked) setLiked(false);
    } catch (err) {
      console.error('Feedback failed:', err);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    try {
      await feedbackService.toggleFavorite({
        item_id: track.id,
        item_type: 'music',
        title: track.title,
        subtitle: track.artist,
        artwork_url: track.artwork_url || track.poster_path
      });
      setFavorited(!favorited);
      if (onFavoriteToggle) onFavoriteToggle();
    } catch (err) {
      console.error('Favorite failed:', err);
    }
  };

  const artwork = track.artwork_url || track.poster_path || 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';

  const audio = track.audio_features || {};
  const streaming = track.streaming_platforms || [];

  return (
    <div
      onClick={() => navigate(`/music/${track.id}`)}
      className={`group relative glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all ${
        isCurrentPlaying ? 'border-brand-purple glow-purple scale-[1.02]' : ''
      }`}
    >
      {/* Artwork Poster Media */}
      <div className="relative w-full aspect-square overflow-hidden bg-slate-800">
        <img
          src={artwork}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-black/40 opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Floating Play/Pause Action */}
        <button
          onClick={handlePlayClick}
          className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isCurrentPlaying
              ? 'bg-brand-cyan text-dark-900 opacity-100 scale-100 shadow-xl glow-cyan'
              : 'bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-brand-cyan hover:text-dark-900'
          }`}
        >
          {isCurrentPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {track.similarity ? (
            <Badge variant="cyan" size="xs" className="gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              {Math.round(track.similarity * 100)}% Match
            </Badge>
          ) : (
            <Badge variant="default" size="xs" className="uppercase font-semibold tracking-wider">
              {track.genre}
            </Badge>
          )}

          <button
            onClick={handleFavorite}
            className={`p-1.5 rounded-full pointer-events-auto backdrop-blur-md transition-all ${
              favorited ? 'bg-rose-500 text-white shadow-md' : 'bg-black/40 text-slate-300 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Top Floating Music Platform Pill */}
        {streaming.length > 0 && (
          <div className="absolute top-10 left-2.5 pointer-events-auto">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Radio className="w-2.5 h-2.5" /> Spotify
            </span>
          </div>
        )}

        {/* Hover Feedback */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <button
            onClick={handleLike}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
              liked ? 'bg-brand-emerald text-white' : 'bg-black/60 text-slate-300 hover:text-white'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
          </button>
          <button
            onClick={handleDislike}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
              disliked ? 'bg-rose-600 text-white' : 'bg-black/60 text-slate-300 hover:text-white'
            }`}
          >
            <ThumbsDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-3.5 flex flex-col justify-between flex-grow">
        <div>
          <h4 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors truncate">
            {track.title}
          </h4>
          <p className="text-xs text-slate-400 truncate mt-0.5">{track.artist}</p>
        </div>

        {/* Audio Feature Bars Indicator */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
          <div>
            <div className="flex justify-between mb-0.5">
              <span>Energy</span>
              <span>{Math.round((audio.energy || 0.5) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-purple h-full rounded-full"
                style={{ width: `${(audio.energy || 0.5) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-0.5">
              <span>Valence</span>
              <span>{Math.round((audio.valence || 0.5) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-cyan h-full rounded-full"
                style={{ width: `${(audio.valence || 0.5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Feature Explanation */}
        {track.explanation && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-brand-purple/90 leading-tight line-clamp-2">
            🎵 {track.explanation}
          </div>
        )}
      </div>
    </div>
  );
};
