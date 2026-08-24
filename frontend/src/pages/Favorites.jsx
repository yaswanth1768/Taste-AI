import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Film, Music, Trash2, ArrowRight } from 'lucide-react';
import { feedbackService } from '../services/feedbackService';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const Favorites = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchFavs = async () => {
      setLoading(true);
      try {
        const data = await feedbackService.getFavorites();
        setFavorites(data);
      } catch (err) {
        console.error('Failed fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavs();
  }, [isAuthenticated, navigate]);

  const handleRemove = async (fav) => {
    try {
      await feedbackService.toggleFavorite({
        item_id: fav.item_id,
        item_type: fav.item_type,
        title: fav.title
      });
      setFavorites(favorites.filter(f => f.id !== fav.id));
    } catch (err) {
      console.error('Failed removing favorite:', err);
    }
  };

  const movies = favorites.filter(f => f.item_type === 'movie');
  const tracks = favorites.filter(f => f.item_type === 'music');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> Your Entertainment Library
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Saved bookmarks and favorite titles that actively steer your real-time personalization model.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 animate-pulse">
          Loading your library...
        </div>
      ) : favorites.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center space-y-4 max-w-lg mx-auto">
          <Heart className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your library is currently empty</h3>
          <p className="text-xs text-slate-400">
            Click the heart icon on any movie card or music track to bookmark it and enhance your AI recommendations.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/movies" className="px-5 py-2.5 rounded-xl bg-brand-purple text-white text-xs font-semibold">
              Browse Movies
            </Link>
            <Link to="/music" className="px-5 py-2.5 rounded-xl bg-brand-cyan text-dark-900 text-xs font-bold">
              Browse Music
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Saved Movies */}
          {movies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-brand-purple" /> Saved Movies ({movies.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {movies.map((m) => (
                  <div key={m.id} className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3 group">
                    <div 
                      onClick={() => navigate(`/movies/${m.item_id}`)}
                      className="flex items-center gap-3 overflow-hidden cursor-pointer flex-grow"
                    >
                      <div className="w-12 h-16 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                        {m.artwork_url ? (
                          <img src={m.artwork_url} alt={m.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <Film className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-purple transition-colors">
                          {m.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{m.subtitle || 'Movie'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(m)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove from Library"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Music */}
          {tracks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-brand-cyan" /> Saved Music ({tracks.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tracks.map((t) => (
                  <div key={t.id} className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3 group">
                    <div 
                      onClick={() => navigate(`/music/${t.item_id}`)}
                      className="flex items-center gap-3 overflow-hidden cursor-pointer flex-grow"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                        {t.artwork_url ? (
                          <img src={t.artwork_url} alt={t.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <Music className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-cyan transition-colors">
                          {t.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{t.subtitle || 'Track'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(t)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove from Library"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
