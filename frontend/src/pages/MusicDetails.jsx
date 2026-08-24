import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Pause, Heart, ArrowLeft, Sparkles, Music, Film, Disc, Activity, Radio, ExternalLink, CheckCircle2 } from 'lucide-react';
import { musicService } from '../services/musicService';
import { recommendationService } from '../services/recommendationService';
import { TrackCard } from '../components/music/TrackCard';
import { MovieCard } from '../components/movies/MovieCard';
import { AudioFeatureRadar } from '../components/music/AudioFeatureRadar';
import { Badge } from '../components/common/Badge';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { feedbackService } from '../services/feedbackService';

const MUSIC_PLATFORM_DETAILS = {
  "spotify": {
    bg: "bg-emerald-950/40 border-emerald-600/50 hover:bg-emerald-900/40",
    badge: "bg-emerald-500 text-white",
    name: "Spotify",
    desc: "Stream in Hi-Fi Audio"
  },
  "apple music": {
    bg: "bg-rose-950/40 border-rose-600/50 hover:bg-rose-900/40",
    badge: "bg-rose-600 text-white",
    name: "Apple Music",
    desc: "Stream Lossless & Spatial Audio"
  },
  "youtube music": {
    bg: "bg-red-950/40 border-red-600/50 hover:bg-red-900/40",
    badge: "bg-red-600 text-white",
    name: "YouTube Music",
    desc: "Listen with Official Music Videos"
  },
  "amazon music": {
    bg: "bg-cyan-950/40 border-cyan-600/50 hover:bg-cyan-900/40",
    badge: "bg-cyan-600 text-white",
    name: "Amazon Music",
    desc: "Included with Prime"
  }
};

export const MusicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const { isAuthenticated } = useAuth();
  const [track, setTrack] = useState(null);
  const [similarTracks, setSimilarTracks] = useState([]);
  const [crossDomainMovies, setCrossDomainMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const fetchTrackData = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const [trk, recs, cross] = await Promise.all([
          musicService.getTrackDetails(id),
          recommendationService.getMusicRecommendations(id, 6),
          recommendationService.getCrossDomain({ song_id: id, limit: 6 })
        ]);
        setTrack(trk);
        setSimilarTracks(recs?.recommendations || []);
        setCrossDomainMovies(cross?.recommended_movies || []);
      } catch (err) {
        console.error('Failed fetching track details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrackData();
  }, [id]);

  const handleFavoriteToggle = async () => {
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

  if (!track) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Track Not Found</h2>
        <p className="text-sm text-slate-400">The requested audio track could not be retrieved.</p>
        <Link to="/music" className="inline-block px-6 py-2.5 rounded-xl bg-brand-cyan text-dark-900 text-sm font-bold">
          Back to Music
        </Link>
      </div>
    );
  }

  const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
  const artwork = track.artwork_url || track.poster_path || 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';

  const streamingPlatforms = track.streaming_platforms || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Music
        </button>

        <div className="text-xs text-slate-400">
          Music / <span className="text-white font-medium">{track.title}</span>
        </div>
      </div>

      {/* Main Track Hero Showcase */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-700/60 p-6 sm:p-10 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
          
          {/* Track Artwork / Poster */}
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-800 shadow-2xl border border-slate-700/50 relative group">
            <img src={artwork} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            
            <button
              onClick={() => playTrack(track)}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-brand-cyan text-dark-900 flex items-center justify-center shadow-xl hover:scale-110 transition-transform glow-cyan"
            >
              {isCurrentPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </button>
          </div>

          {/* Metadata */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan" size="sm" className="capitalize">{track.genre}</Badge>
              <Badge variant="glass" size="sm">Pop. Index: {track.popularity}</Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {track.title}
            </h1>

            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-300">
                {track.artist}
              </p>
              <p className="text-xs text-slate-400">
                Album: {track.album || 'Single Release'}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
              <button
                onClick={() => playTrack(track)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-500 hover:opacity-90 text-dark-900 font-bold text-sm flex items-center gap-2 shadow-lg shadow-brand-cyan/25 transition-all"
              >
                {isCurrentPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {isCurrentPlaying ? 'Pause Audio' : 'Play 30s Preview'}
              </button>

              <button
                onClick={handleFavoriteToggle}
                className={`px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                  favorited
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : 'glass-card text-slate-200 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-white' : ''}`} />
                {favorited ? 'Favorited' : 'Add to Library'}
              </button>

              <button
                onClick={() => navigate(`/recommendations?tab=cross&songId=${track.id}`)}
                className="px-5 py-3 rounded-xl bg-brand-purple/20 border border-brand-purple/40 text-white text-sm font-semibold flex items-center gap-2 hover:bg-brand-purple/30"
              >
                <Film className="w-4 h-4 text-brand-purple" /> Cinema Matches
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* WHERE TO STREAM MUSIC SECTION */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/70 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2.5">
              <Radio className="w-6 h-6 text-brand-cyan" /> Where to Stream & Listen
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Active streaming platforms and direct links for '{track.title}' by {track.artist}.
            </p>
          </div>
          <Badge variant="emerald" size="md" className="gap-1.5 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Music Feeds
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {streamingPlatforms.map((plat, idx) => {
            const details = MUSIC_PLATFORM_DETAILS[plat.name.toLowerCase()] || {
              bg: "bg-slate-800/60 border-slate-700 hover:bg-slate-700/60",
              badge: "bg-brand-cyan text-dark-900",
              name: plat.name,
              desc: "Listen Online"
            };

            return (
              <a
                key={idx}
                href={plat.watch_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer ${details.bg}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-md ${details.badge}`}>
                    {plat.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">
                      {details.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{details.desc}</p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/10 text-slate-300 group-hover:text-white group-hover:bg-brand-cyan group-hover:text-dark-900 transition-all">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Audio DSP Feature Breakdown */}
      <AudioFeatureRadar features={track.audio_features || {}} />

      {/* Similar Music Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-cyan" />
              <span>Similar Tracks (Audio & DSP Neighbors)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              StandardScaled audio features + TF-IDF genre embeddings using Cosine NearestNeighbors
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
          {similarTracks.map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </div>
      </div>

      {/* Cross-Domain Cinema Section (Music -> Movie) */}
      {crossDomainMovies && crossDomainMovies.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Film className="w-5 h-5 text-brand-purple" />
                <span>Cinematic Movies Matching '{track.title}'</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                AI Cross-Domain Engine translating {track.genre.toUpperCase()} rhythms and acoustic dynamics to cinema
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
            {crossDomainMovies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
