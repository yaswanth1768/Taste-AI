import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Film, Music, Smile, Compass, RefreshCw, Layers, Tv } from 'lucide-react';
import { recommendationService } from '../services/recommendationService';
import { movieService } from '../services/movieService';
import { musicService } from '../services/musicService';
import { MovieCard } from '../components/movies/MovieCard';
import { TrackCard } from '../components/music/TrackCard';
import { MoodSelector } from '../components/recommendations/MoodSelector';
import { Badge } from '../components/common/Badge';
import { GridSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';

export const Recommendations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'personalized';
  const initialMood = searchParams.get('mood') || 'Happy';
  const initialMovieId = searchParams.get('movieId');
  const initialSongId = searchParams.get('songId');

  const [activeTab, setActiveTab] = useState(initialTab);
  const [mood, setMood] = useState(initialMood);
  const [loading, setLoading] = useState(true);

  // Data states
  const [personalizedData, setPersonalizedData] = useState(null);
  const [moodData, setMoodData] = useState(null);
  const [crossDomainData, setCrossDomainData] = useState(null);

  // Movie & Music pickers for Cross-Domain
  const [sampleMovies, setSampleMovies] = useState([]);
  const [sampleTracks, setSampleTracks] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState(initialMovieId || 157336);
  const [selectedSongId, setSelectedSongId] = useState(initialSongId || 't_0001');
  const [crossQueryType, setCrossQueryType] = useState('movie'); // 'movie' or 'music'

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
    const moodParam = searchParams.get('mood');
    if (moodParam) setMood(moodParam);
  }, [searchParams]);

  // Load sample pickers for Cross-Domain
  useEffect(() => {
    const fetchPickers = async () => {
      try {
        const [mList, tList] = await Promise.all([
          movieService.getPopular(12),
          musicService.getPopular(12)
        ]);
        setSampleMovies(mList);
        setSampleTracks(tList);
        if (!initialMovieId && mList.length > 0) setSelectedMovieId(mList[0].id);
        if (!initialSongId && tList.length > 0) setSelectedSongId(tList[0].id);
      } catch (err) {
        console.error('Picker fetch failed:', err);
      }
    };
    fetchPickers();
  }, []);

  // Fetch active tab data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'personalized') {
          const res = await recommendationService.getPersonalized(12);
          setPersonalizedData(res);
        } else if (activeTab === 'mood') {
          const res = await recommendationService.getMoodRecommendations(mood, 12);
          setMoodData(res);
        } else if (activeTab === 'cross') {
          const params = crossQueryType === 'movie' 
            ? { movie_id: selectedMovieId, limit: 12 }
            : { song_id: selectedSongId, limit: 12 };
          const res = await recommendationService.getCrossDomain(params);
          setCrossDomainData(res);
        }
      } catch (err) {
        console.error('Recommendation fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, mood, selectedMovieId, selectedSongId, crossQueryType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      
      {/* Header & Tabs */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Compass className="w-8 h-8 text-brand-purple" /> AI Discovery Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Multi-paradigm recommendation system orchestrating content similarity, audio feature vectors, mood profiles, and cross-domain bridges
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border border-slate-800 w-fit">
          <button
            onClick={() => { setActiveTab('personalized'); setSearchParams({ tab: 'personalized' }); }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'personalized'
                ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Hybrid Personalization
          </button>

          <button
            onClick={() => { setActiveTab('mood'); setSearchParams({ tab: 'mood', mood }); }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'mood'
                ? 'bg-brand-cyan text-dark-900 font-bold shadow-md shadow-brand-cyan/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smile className="w-4 h-4" /> Mood Explorer
          </button>

          <button
            onClick={() => { setActiveTab('cross'); setSearchParams({ tab: 'cross' }); }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'cross'
                ? 'bg-brand-violet text-white shadow-md shadow-brand-violet/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Cross-Domain Studio
          </button>
        </div>
      </div>

      {/* TAB 1: Hybrid Personalization */}
      {activeTab === 'personalized' && (
        <div className="space-y-12 animate-fade-in">
          
          {/* Formula banner */}
          <div className="glass-panel rounded-3xl p-6 border border-brand-purple/30 bg-brand-purple/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-purple uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Active Personalization Formula
            </div>
            <div className="font-mono text-xs text-slate-300">
              Final Score = 0.40 × ContentSim + 0.25 × UserPref + 0.15 × Popularity + 0.10 × Feedback + 0.10 × Diversity
            </div>
          </div>

          {/* Personalized Movies */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-brand-purple" /> Cinema Discoveries For You
              </h2>
            </div>

            {loading ? (
              <GridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {personalizedData?.recommended_movies?.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            )}
          </div>

          {/* Personalized Music */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-brand-cyan" /> Audio Tracks For You
              </h2>
            </div>

            {loading ? (
              <GridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {personalizedData?.recommended_music?.map((t) => (
                  <TrackCard key={t.id} track={t} />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Mood Explorer */}
      {activeTab === 'mood' && (
        <div className="space-y-10 animate-fade-in">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Select Emotional Vibe</h2>
                <p className="text-xs text-slate-400">Curates audio features & movie narratives for your current state.</p>
              </div>
              <Badge variant="cyan" size="md">{mood} Mood Active</Badge>
            </div>

            <MoodSelector selectedMood={mood} onSelectMood={(m) => { setMood(m); setSearchParams({ tab: 'mood', mood: m }); }} />
          </div>

          {moodData?.explanation && (
            <div className="glass-panel rounded-2xl p-4 border border-brand-cyan/30 text-xs text-brand-cyan">
              🌟 {moodData.explanation}
            </div>
          )}

          {/* Mood Movies */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-brand-purple" /> {mood} Cinema Selection
            </h3>
            {loading ? <GridSkeleton count={6} /> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {moodData?.movies?.map((m) => <MovieCard key={m.id} movie={m} />)}
              </div>
            )}
          </div>

          {/* Mood Music */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-brand-cyan" /> {mood} Soundtracks & Beats
            </h3>
            {loading ? <GridSkeleton count={6} /> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {moodData?.music?.map((t) => <TrackCard key={t.id} track={t} />)}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: Cross-Domain Studio with Visual Image Cards */}
      {activeTab === 'cross' && (
        <div className="space-y-10 animate-fade-in">
          
          {/* Query Mode Switcher */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-violet" /> Movie ⟷ Music Cross-Domain Engine
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Translates narrative themes, directors, and genres into acoustic features, and vice versa.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setCrossQueryType('movie')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
                    crossQueryType === 'movie' ? 'bg-brand-purple text-white' : 'text-slate-400'
                  }`}
                >
                  Movie ➔ Music
                </button>
                <button
                  onClick={() => setCrossQueryType('music')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
                    crossQueryType === 'music' ? 'bg-brand-cyan text-dark-900 font-bold' : 'text-slate-400'
                  }`}
                >
                  Music ➔ Movie
                </button>
              </div>
            </div>

            {/* Selector Grid with Visual Posters */}
            {crossQueryType === 'movie' ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Select Seed Film to Find Matching Soundtracks:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {sampleMovies.map((m) => {
                    const isSelected = selectedMovieId === m.id;
                    const poster = m.poster_path || m.artwork_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80";
                    const ott = m.streaming_platforms?.[0]?.name;

                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMovieId(m.id)}
                        className={`relative rounded-2xl overflow-hidden glass-card cursor-pointer transition-all aspect-[2/3] group ${
                          isSelected ? 'border-2 border-brand-purple scale-105 glow-purple' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        
                        {/* Top OTT badge if present */}
                        {ott && (
                          <div className="absolute top-2 left-2">
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-brand-cyan backdrop-blur-sm border border-white/10">
                              {ott}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-black/30 p-2.5 flex flex-col justify-end">
                          <div className="text-xs font-bold text-white leading-tight truncate">{m.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{m.director}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Select Seed Track to Find Matching Cinema:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {sampleTracks.map((t) => {
                    const isSelected = selectedSongId === t.id;
                    const artwork = t.artwork_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80';

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedSongId(t.id)}
                        className={`relative rounded-2xl overflow-hidden glass-card cursor-pointer transition-all aspect-square group ${
                          isSelected ? 'border-2 border-brand-cyan scale-105 glow-cyan' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={artwork} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-black/30 p-2.5 flex flex-col justify-end">
                          <div className="text-xs font-bold text-white leading-tight truncate">{t.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{t.artist}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Results Showcase */}
          {crossDomainData && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {crossQueryType === 'movie' ? 'Matched Soundtracks' : 'Matched Cinematic Films'}
                  </h3>
                  <p className="text-xs text-brand-cyan mt-0.5">
                    Theme: {crossDomainData.cross_domain_theme}
                  </p>
                </div>
                <Badge variant="glass" size="md">
                  Seed: {crossDomainData.query_item}
                </Badge>
              </div>

              {loading ? (
                <GridSkeleton count={6} />
              ) : crossQueryType === 'movie' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                  {crossDomainData.recommended_tracks?.map((t) => (
                    <TrackCard key={t.id} track={t} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                  {crossDomainData.recommended_movies?.map((m) => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
