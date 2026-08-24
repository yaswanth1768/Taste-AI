import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Film, Music, Check, ArrowRight, ArrowLeft, Heart, Smile, Tv, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

const MOVIE_GENRES = [
  "Action", "Adventure", "Science Fiction", "Drama", "Comedy", 
  "Thriller", "Crime", "Animation", "Romance", "Fantasy", "Mystery", "Family"
];

const MUSIC_GENRES = [
  "pop", "rock", "hip-hop", "edm", "classical", 
  "jazz", "lo-fi", "indie", "chill", "soundtrack", "r-b", "metal"
];

const SAMPLE_MOVIES = [
  { 
    id: 19995, 
    title: "Avatar", 
    year: "2009", 
    genre: "Sci-Fi", 
    poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    ott: "Disney+"
  },
  { 
    id: 157336, 
    title: "Interstellar", 
    year: "2014", 
    genre: "Sci-Fi", 
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    ott: "Netflix"
  },
  { 
    id: 27205, 
    title: "Inception", 
    year: "2010", 
    genre: "Action", 
    poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    ott: "Max"
  },
  { 
    id: 155, 
    title: "The Dark Knight", 
    year: "2008", 
    genre: "Crime", 
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    ott: "Prime Video"
  },
  { 
    id: 603, 
    title: "The Matrix", 
    year: "1999", 
    genre: "Sci-Fi", 
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    ott: "Max"
  },
  { 
    id: 597, 
    title: "Titanic", 
    year: "1997", 
    genre: "Romance", 
    poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    ott: "Disney+"
  },
  { 
    id: 680, 
    title: "Pulp Fiction", 
    year: "1994", 
    genre: "Thriller", 
    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    ott: "Netflix"
  },
  { 
    id: 313369, 
    title: "La La Land", 
    year: "2016", 
    genre: "Romance", 
    poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkVJt0Rf0.jpg",
    ott: "Apple TV+"
  },
];

const SAMPLE_ARTISTS = [
  { name: "The Weeknd", genre: "R&B / Pop", poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80" },
  { name: "Taylor Swift", genre: "Pop / Indie", poster: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80" },
  { name: "Hans Zimmer", genre: "Cinematic / OST", poster: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=400&q=80" },
  { name: "Daft Punk", genre: "Electronic / Disco", poster: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80" },
  { name: "Drake", genre: "Hip-Hop", poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80" },
  { name: "Imagine Dragons", genre: "Alt Rock", poster: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=400&q=80" },
  { name: "Kendrick Lamar", genre: "Hip-Hop", poster: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80" },
  { name: "Avicii", genre: "EDM / Dance", poster: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80" },
  { name: "Billie Eilish", genre: "Alt Pop", poster: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80" },
  { name: "Queen", genre: "Classic Rock", poster: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=400&q=80" },
  { name: "Post Malone", genre: "Pop / Trap", poster: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80" },
  { name: "Ludovico Einaudi", genre: "Neo-Classical", poster: "https://images.unsplash.com/photo-1520523839898-507125ef538a?auto=format&fit=crop&w=400&q=80" },
];

const MOODS = ["Happy", "Sad", "Workout", "Relax", "Focus", "Romantic"];

export const Onboarding = () => {
  const { user, updatePreferences, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedMovieGenres, setSelectedMovieGenres] = useState(user?.preferences?.favorite_movie_genres || ["Action", "Science Fiction"]);
  const [selectedMusicGenres, setSelectedMusicGenres] = useState(user?.preferences?.favorite_music_genres || ["pop", "edm"]);
  const [selectedMovies, setSelectedMovies] = useState(user?.preferences?.favorite_movies || ["Avatar", "Interstellar"]);
  const [selectedArtists, setSelectedArtists] = useState(user?.preferences?.favorite_artists || ["Hans Zimmer", "The Weeknd"]);
  const [selectedMood, setSelectedMood] = useState(user?.preferences?.preferred_mood || "Happy");
  const [saving, setSaving] = useState(false);

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      if (isAuthenticated) {
        await updatePreferences({
          favorite_movie_genres: selectedMovieGenres,
          favorite_music_genres: selectedMusicGenres,
          favorite_movies: selectedMovies,
          favorite_artists: selectedArtists,
          preferred_language: "en",
          preferred_mood: selectedMood,
          onboarding_completed: true
        });
      }
      navigate('/');
    } catch (err) {
      console.error('Onboarding save failed:', err);
      navigate('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-700/60 shadow-2xl space-y-8 animate-fade-in">
        
        {/* Step Indicator Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="primary" size="md" className="gap-1.5 glow-purple">
              <Sparkles className="w-4 h-4" /> Taste Profile Calibration
            </Badge>
            <span className="text-xs font-semibold text-slate-400">Step {step} of 5</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-purple via-brand-violet to-brand-cyan h-full rounded-full transition-all duration-500"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Movie Genres */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Film className="w-6 h-6 text-brand-purple" /> Select Favorite Movie Genres
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Choose 2 or more cinematic genres to seed your content-based similarity vectors.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {MOVIE_GENRES.map((genre) => {
                const isSelected = selectedMovieGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => toggleItem(selectedMovieGenres, setSelectedMovieGenres, genre)}
                    className={`p-4 rounded-2xl glass-card flex items-center justify-between text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-purple/25 border-brand-purple text-white glow-purple'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{genre}</span>
                    {isSelected && <Check className="w-4 h-4 text-brand-cyan" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Music Genres */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Music className="w-6 h-6 text-brand-cyan" /> Select Favorite Music Genres
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Select styles you enjoy to configure audio feature clustering and Spotify embeddings.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {MUSIC_GENRES.map((genre) => {
                const isSelected = selectedMusicGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => toggleItem(selectedMusicGenres, setSelectedMusicGenres, genre)}
                    className={`p-4 rounded-2xl glass-card flex items-center justify-between text-sm font-semibold capitalize transition-all ${
                      isSelected
                        ? 'bg-brand-cyan/25 border-brand-cyan text-white glow-cyan'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{genre}</span>
                    {isSelected && <Check className="w-4 h-4 text-brand-purple" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Favorite Movies with Posters & OTT Badges */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-400" /> Pick Movies You Love
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Select films to initialize your personalized cosine similarity profile and streaming preferences.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SAMPLE_MOVIES.map((movie) => {
                const isSelected = selectedMovies.includes(movie.title);
                return (
                  <div
                    key={movie.id}
                    onClick={() => toggleItem(selectedMovies, setSelectedMovies, movie.title)}
                    className={`relative rounded-2xl overflow-hidden glass-card cursor-pointer transition-all aspect-[2/3] group ${
                      isSelected ? 'border-2 border-brand-purple scale-[1.03] glow-purple' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    
                    {/* Top OTT Badge & Checkmark */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                        <Tv className="w-2.5 h-2.5 text-brand-cyan" /> {movie.ott}
                      </span>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-brand-purple flex items-center justify-center text-white shadow-lg">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-black/30 p-3 flex flex-col justify-end">
                      <div className="text-xs font-bold text-white leading-tight">{movie.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{movie.year} • {movie.genre}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Favorite Artists with Visual Album Posters */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Music className="w-6 h-6 text-brand-purple" /> Select Favorite Musical Artists & Composers
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Choose artists to calibrate your audio NearestNeighbors profile and soundtrack preferences.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {SAMPLE_ARTISTS.map((artist) => {
                const isSelected = selectedArtists.includes(artist.name);
                return (
                  <div
                    key={artist.name}
                    onClick={() => toggleItem(selectedArtists, setSelectedArtists, artist.name)}
                    className={`relative rounded-2xl overflow-hidden glass-card cursor-pointer transition-all aspect-square group ${
                      isSelected ? 'border-2 border-brand-cyan scale-[1.03] glow-cyan' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    <img src={artist.poster} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    
                    {/* Top Spotify Badge & Checkmark */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-emerald-400 border border-white/20 flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5" /> Spotify
                      </span>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-brand-cyan flex items-center justify-center text-dark-900 font-bold shadow-lg">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-black/30 p-3 flex flex-col justify-end">
                      <div className="text-xs font-bold text-white leading-tight">{artist.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{artist.genre}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Current Mood */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Smile className="w-6 h-6 text-amber-400" /> What's Your Current Vibe or Mood?
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Your dashboard will feature instant recommendations tuned to this emotional state.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {MOODS.map((mood) => {
                const isSelected = selectedMood.toLowerCase() === mood.toLowerCase();
                return (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`p-6 rounded-2xl glass-card flex flex-col items-center justify-center text-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-brand-purple/25 border-brand-purple text-white glow-purple scale-105'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-lg font-bold">{mood}</span>
                    {isSelected && <span className="text-xs text-brand-cyan font-medium">Active Mood</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Actions Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl glass-card text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-violet text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-brand-purple/25"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-90 text-white text-sm font-bold flex items-center gap-2 shadow-xl glow-purple"
            >
              {saving ? 'Synthesizing Taste Model...' : 'Launch Personalized Discovery 🚀'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
