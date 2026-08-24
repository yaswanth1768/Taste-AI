import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Film, Music, Compass, TrendingUp, Heart, ArrowRight, Play, Star, ChevronRight, Tv, ExternalLink } from 'lucide-react';
import { recommendationService } from '../services/recommendationService';
import { movieService } from '../services/movieService';
import { musicService } from '../services/musicService';
import { MovieCard } from '../components/movies/MovieCard';
import { TrackCard } from '../components/music/TrackCard';
import { MoodSelector } from '../components/recommendations/MoodSelector';
import { Badge } from '../components/common/Badge';
import { GridSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularMusic, setPopularMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('Happy');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [recRes, movRes, musRes] = await Promise.all([
          recommendationService.getPersonalized(8),
          movieService.getPopular(6),
          musicService.getPopular(6)
        ]);
        setData(recRes);
        setPopularMovies(movRes);
        setPopularMusic(musRes);
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    navigate(`/recommendations?tab=mood&mood=${mood}`);
  };

  const heroMovie = data?.recommended_movies?.[0] || popularMovies?.[0] || {
    id: 157336,
    title: "Interstellar",
    overview: "Interstellar chronicles the adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
    director: "Christopher Nolan",
    genres: ["Adventure", "Drama", "Science Fiction"],
    vote_average: 8.1,
    similarity: 0.94,
    poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/rAiYTnrnRMy0nhjSd7CVXYv7e9Y.jpg",
    streaming_platforms: [
      { name: "Netflix", type: "Subscription", watch_url: "https://www.netflix.com/search?q=Interstellar" },
      { name: "Prime Video", type: "Subscription", watch_url: "https://www.amazon.com/s?k=Interstellar&i=instant-video" }
    ],
    explanation: "Top AI discovery matching your preference for Sci-Fi narratives and immersive soundscapes."
  };

  const heroStreaming = heroMovie.streaming_platforms || [];

  return (
    <div className="space-y-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 animate-fade-in">
      
      {/* Hero Spotlight Banner */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-slate-700/60 p-8 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/90 to-transparent z-10" />
        <img
          src={heroMovie.backdrop_path || heroMovie.poster_path || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"}
          alt="Hero Backdrop"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
        />

        <div className="relative z-20 max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" size="md" className="gap-1.5 glow-purple">
              <Sparkles className="w-3.5 h-3.5" /> AI Spotlight
            </Badge>
            {heroMovie.similarity && (
              <Badge variant="cyan" size="md">
                {Math.round(heroMovie.similarity * 100)}% Taste Match
              </Badge>
            )}
            <Badge variant="glass" size="md" className="gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {heroMovie.vote_average || 8.0} Rating
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans leading-tight">
            {heroMovie.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed">
            {heroMovie.overview}
          </p>

          {/* OTT Streaming Availability Indicator */}
          {heroStreaming.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Tv className="w-3.5 h-3.5 text-brand-cyan" /> Streaming On:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {heroStreaming.map((s, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/90 text-white border border-slate-700/70 font-semibold shadow-sm">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Genuine Explanation */}
          <div className="p-3.5 rounded-2xl bg-brand-purple/15 border border-brand-purple/30 text-xs text-brand-cyan flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-brand-purple" />
            <span>{heroMovie.explanation || "Recommended based on your personalized hybrid entertainment taste model."}</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/movies/${heroMovie.id}`)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-violet hover:opacity-90 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-brand-purple/30 transition-all"
            >
              Explore Movie Details <ArrowRight className="w-4 h-4" />
            </button>

            {heroStreaming?.[0]?.watch_url && (
              <a
                href={heroStreaming[0].watch_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/30 text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Watch on {heroStreaming[0].name}
              </a>
            )}

            <button
              onClick={() => navigate(`/recommendations?tab=cross&movieId=${heroMovie.id}`)}
              className="px-5 py-3 rounded-xl glass-card text-slate-200 hover:text-white text-sm font-semibold flex items-center gap-2"
            >
              <Music className="w-4 h-4 text-brand-cyan" /> Soundtracks
            </button>
          </div>
        </div>
      </section>

      {/* Mood Selector Quick Strip */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Explore by Mood</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live AI matching between emotional mood bands, audio DSP attributes, and cinematic narratives
            </p>
          </div>
          <Link
            to="/recommendations?tab=mood"
            className="text-xs font-semibold text-brand-purple hover:text-brand-cyan flex items-center gap-1 transition-colors"
          >
            All Moods <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <MoodSelector selectedMood={selectedMood} onSelectMood={handleMoodSelect} />
      </section>

      {/* Section 1: Recommended Movies For You (Hybrid Personalization) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Film className="w-5 h-5 text-brand-purple" />
              <span>Recommended Movies For You</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Weighted hybrid scoring with OTT streaming provider tags
            </p>
          </div>
          <Link
            to="/movies"
            className="text-xs font-semibold text-brand-purple hover:text-brand-cyan flex items-center gap-1 transition-colors"
          >
            View Movie Catalog <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {data?.recommended_movies?.slice(0, 6).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Recommended Music For You */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Music className="w-5 h-5 text-brand-cyan" />
              <span>Recommended Music Tracks</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              NearestNeighbors audio embeddings (Energy, Valence, Danceability) & genre clustering
            </p>
          </div>
          <Link
            to="/music"
            className="text-xs font-semibold text-brand-cyan hover:text-brand-purple flex items-center gap-1 transition-colors"
          >
            View Music Catalog <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {data?.recommended_music?.slice(0, 6).map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        )}
      </section>

      {/* Section 3: "Because You Liked..." Context Row */}
      {data?.because_you_liked_movies && data.because_you_liked_movies.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-amber" />
                <span>Because You Liked Your Top Picks</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Deep content-based cosine similarity on director, top cast, keywords & synopsis tokens
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {data.because_you_liked_movies.slice(0, 6).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Trending Box Office & Top Music Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* Trending Cinema */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-purple" /> Trending Movies
            </h3>
            <Link to="/movies" className="text-xs text-slate-400 hover:text-white">Explore All</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {popularMovies.slice(0, 3).map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </div>

        {/* Trending Tracks */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-cyan" /> Popular Music Tracks
            </h3>
            <Link to="/music" className="text-xs text-slate-400 hover:text-white">Explore All</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {popularMusic.slice(0, 3).map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
