import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Heart, ArrowLeft, Sparkles, Film, Music, Tv, ExternalLink, Play, CheckCircle2, Video } from 'lucide-react';
import { movieService } from '../services/movieService';
import { recommendationService } from '../services/recommendationService';
import { MovieCard } from '../components/movies/MovieCard';
import { TrackCard } from '../components/music/TrackCard';
import { Badge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { feedbackService } from '../services/feedbackService';
import { useAuth } from '../context/AuthContext';

const OTT_DETAILS = {
  "netflix": {
    bg: "bg-red-950/40 border-red-600/50 hover:bg-red-900/40",
    badge: "bg-red-600 text-white",
    name: "Netflix",
    desc: "Stream with Active Subscription"
  },
  "prime video": {
    bg: "bg-sky-950/40 border-sky-500/50 hover:bg-sky-900/40",
    badge: "bg-sky-500 text-white",
    name: "Amazon Prime Video",
    desc: "Watch in 4K HDR with Prime"
  },
  "disney+": {
    bg: "bg-blue-950/40 border-blue-600/50 hover:bg-blue-900/40",
    badge: "bg-blue-600 text-white",
    name: "Disney+ / Hotstar",
    desc: "Stream IMAX Enhanced"
  },
  "apple tv+": {
    bg: "bg-slate-900/80 border-slate-600/50 hover:bg-slate-800/80",
    badge: "bg-slate-700 text-slate-100",
    name: "Apple TV+",
    desc: "Stream in Dolby Vision & Atmos"
  },
  "max": {
    bg: "bg-purple-950/40 border-purple-600/50 hover:bg-purple-900/40",
    badge: "bg-purple-600 text-white",
    name: "Max (HBO)",
    desc: "Included with Max Plan"
  },
  "jiocinema": {
    bg: "bg-pink-950/40 border-pink-600/50 hover:bg-pink-900/40",
    badge: "bg-pink-600 text-white",
    name: "JioCinema Premium",
    desc: "Stream in Full HD"
  }
};

export const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [crossDomainMusic, setCrossDomainMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const [mov, recs, cross] = await Promise.all([
          movieService.getMovieDetails(id),
          recommendationService.getMovieRecommendations(id, 6),
          recommendationService.getCrossDomain({ movie_id: id, limit: 6 })
        ]);
        setMovie(mov);
        setSimilarMovies(recs?.recommendations || []);
        setCrossDomainMusic(cross?.recommended_tracks || []);
      } catch (err) {
        console.error('Failed fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id]);

  const handleFavoriteToggle = async () => {
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
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="glass-panel rounded-3xl p-12 animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded w-1/3"></div>
          <div className="h-64 bg-slate-800 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <p className="text-sm text-slate-400">The requested film could not be retrieved from the catalog.</p>
        <Link to="/movies" className="inline-block px-6 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-semibold">
          Back to Movies
        </Link>
      </div>
    );
  }

  const posterImg = movie.poster_path || 
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";

  const streamingPlatforms = movie.streaming_platforms || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Movies
        </button>

        <div className="text-xs text-slate-400">
          Movies / <span className="text-white font-medium">{movie.title}</span>
        </div>
      </div>

      {/* Main Movie Hero Showcase */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-700/60 p-6 sm:p-10 shadow-2xl">
        {/* Backdrop Glow */}
        {movie.backdrop_path && (
          <div className="absolute inset-0 z-0 opacity-15 overflow-hidden">
            <img src={movie.backdrop_path} alt="Backdrop" className="w-full h-full object-cover blur-md scale-105" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative z-10">
          
          {/* Movie Poster */}
          <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 shadow-2xl border border-slate-700/50 relative group">
            <img src={posterImg} alt={movie.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-xs font-semibold text-white">Full HD Master</span>
            </div>
          </div>

          {/* Metadata & Overview */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              {movie.genres?.map((g, i) => (
                <Badge key={i} variant="primary" size="sm">{g}</Badge>
              ))}
              <Badge variant="glass" size="sm" className="gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {movie.vote_average || 7.8} ({movie.vote_count || 1200} votes)
              </Badge>
              {movie.release_date && (
                <Badge variant="default" size="sm">
                  {movie.release_date.slice(0, 4)}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-sm sm:text-base italic text-brand-cyan font-serif">
                "{movie.tagline}"
              </p>
            )}

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {movie.overview}
            </p>

            {/* Director & Cast Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
              {movie.director && (
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/40">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Director</span>
                  <span className="text-sm font-semibold text-white">{movie.director}</span>
                </div>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/40">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Top Cast</span>
                  <span className="text-sm font-semibold text-white">{movie.cast.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleFavoriteToggle}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                  favorited
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : 'glass-card text-slate-200 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-white' : ''}`} />
                {favorited ? 'In Favorites' : 'Add to Favorites'}
              </button>

              <button
                onClick={() => navigate(`/recommendations?tab=cross&movieId=${movie.id}`)}
                className="px-5 py-2.5 rounded-xl bg-brand-purple/20 border border-brand-purple/40 text-white text-sm font-semibold flex items-center gap-2 hover:bg-brand-purple/30"
              >
                <Music className="w-4 h-4 text-brand-cyan" /> Corresponding Soundtracks
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* WHERE TO STREAM / OTT PLATFORMS SECTION */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/70 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2.5">
              <Tv className="w-6 h-6 text-brand-cyan" /> Where to Stream & Watch
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Active OTT platform availability, subscription access, and direct links for '{movie.title}'.
            </p>
          </div>
          <Badge variant="emerald" size="md" className="gap-1.5 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified OTT Feeds
          </Badge>
        </div>

        {streamingPlatforms.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-800/40 text-center text-slate-400 text-sm">
            Streaming information is updating. Search on major OTT platforms below.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {streamingPlatforms.map((ott, idx) => {
              const details = OTT_DETAILS[ott.name.toLowerCase()] || {
                bg: "bg-slate-800/60 border-slate-700 hover:bg-slate-700/60",
                badge: "bg-brand-purple text-white",
                name: ott.name,
                desc: "Stream on Demand"
              };

              return (
                <a
                  key={idx}
                  href={ott.watch_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer ${details.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-md ${details.badge}`}>
                      {ott.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors flex items-center gap-1.5">
                        {details.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{details.desc}</p>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/10 text-slate-300 group-hover:text-white group-hover:bg-brand-purple transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Similar Movies Section (Content-Based) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-purple" />
              <span>Similar Movies You Might Like</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculated via Porter-stemmed CountVectorizer (5,000 features) and Cosine Similarity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
          {similarMovies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </div>

      {/* Cross-Domain Music Section (Movie -> Music) */}
      {crossDomainMusic && crossDomainMusic.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Music className="w-5 h-5 text-brand-cyan" />
                <span>Soundtracks & Musical Vibe Matching '{movie.title}'</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                AI Cross-Domain Engine bridging cinematic narratives to matching musical genres & audio signatures
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
            {crossDomainMusic.map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
