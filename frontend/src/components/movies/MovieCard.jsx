import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ThumbsUp, ThumbsDown, Heart, Sparkles, Tv, ExternalLink } from 'lucide-react';
import { Badge } from '../common/Badge';
import { feedbackService } from '../../services/feedbackService';
import { useAuth } from '../../context/AuthContext';

const OTT_BRAND_COLORS = {
  "netflix": "bg-red-600/90 text-white border-red-500/50",
  "prime video": "bg-sky-600/90 text-white border-sky-400/50",
  "disney+": "bg-blue-700/90 text-white border-blue-400/50",
  "apple tv+": "bg-slate-700/90 text-slate-100 border-slate-500/50",
  "max": "bg-purple-700/90 text-white border-purple-400/50",
  "jiocinema": "bg-pink-700/90 text-white border-pink-400/50"
};

export const MovieCard = ({ movie, onFavoriteToggle }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    try {
      await feedbackService.recordFeedback({
        item_id: String(movie.id),
        item_type: 'movie',
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
        item_id: String(movie.id),
        item_type: 'movie',
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
        item_id: String(movie.id),
        item_type: 'movie',
        title: movie.title,
        subtitle: movie.director || '',
        artwork_url: movie.poster_path || movie.artwork_url
      });
      setFavorited(!favorited);
      if (onFavoriteToggle) onFavoriteToggle();
    } catch (err) {
      console.error('Favorite failed:', err);
    }
  };

  const posterImg = movie.poster_path || movie.artwork_url || 
    `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80`;

  const streaming = movie.streaming_platforms || [];

  return (
    <div
      onClick={() => navigate(`/movies/${movie.id}`)}
      className="group relative glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      {/* Poster Media */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-slate-800">
        <img
          src={posterImg}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-black/50 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges: Match % & Bookmark */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {movie.similarity ? (
            <Badge variant="primary" size="xs" className="gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              {Math.round(movie.similarity * 100)}% Match
            </Badge>
          ) : (
            <Badge variant="glass" size="xs" className="gap-1 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {movie.vote_average || 7.5}
            </Badge>
          )}

          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full pointer-events-auto backdrop-blur-md transition-all ${
              favorited 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' 
                : 'bg-black/40 text-slate-300 hover:text-white hover:bg-black/60'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* OTT Streaming Platforms Floating Pill Strip */}
        {streaming.length > 0 && (
          <div className="absolute top-11 left-3 flex flex-wrap gap-1 max-w-[85%] pointer-events-auto">
            {streaming.slice(0, 2).map((ott, i) => {
              const colorCls = OTT_BRAND_COLORS[ott.name.toLowerCase()] || "bg-slate-800/90 text-slate-200 border-slate-700";
              return (
                <span
                  key={i}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-md shadow-sm flex items-center gap-1 ${colorCls}`}
                  title={`Stream on ${ott.name}`}
                >
                  <Tv className="w-2.5 h-2.5" />
                  {ott.name}
                </span>
              );
            })}
          </div>
        )}

        {/* Bottom Quick Feedback Actions on Hover */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <button
            onClick={handleLike}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
              liked ? 'bg-brand-emerald text-white' : 'bg-black/60 text-slate-300 hover:text-white'
            }`}
            title="More like this"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDislike}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
              disliked ? 'bg-rose-600 text-white' : 'bg-black/60 text-slate-300 hover:text-white'
            }`}
            title="Fewer like this"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-3.5 flex flex-col flex-grow justify-between">
        <div>
          <h4 className="text-sm font-bold text-white group-hover:text-brand-purple transition-colors truncate">
            {movie.title}
          </h4>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {movie.director ? `Dir. ${movie.director}` : (movie.release_date ? movie.release_date.slice(0, 4) : 'Cinema')}
          </p>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mt-2.5">
          {movie.genres && movie.genres.slice(0, 2).map((g, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/50">
              {g}
            </span>
          ))}
        </div>

        {/* Transparent Feature Explanation */}
        {movie.explanation && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-brand-cyan/90 leading-tight line-clamp-2">
            💡 {movie.explanation}
          </div>
        )}
      </div>
    </div>
  );
};
