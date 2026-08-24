import React, { useState, useEffect } from 'react';
import { Search, Music, SlidersHorizontal, Activity, Zap, Heart, Disc, Radio } from 'lucide-react';
import { musicService } from '../services/musicService';
import { TrackCard } from '../components/music/TrackCard';
import { GridSkeleton } from '../components/common/Skeleton';

const MUSIC_PLATFORM_FILTERS = [
  { id: 'All', name: 'All Services' },
  { id: 'Spotify', name: 'Spotify' },
  { id: 'Apple Music', name: 'Apple Music' },
  { id: 'YouTube Music', name: 'YouTube Music' },
  { id: 'Amazon Music', name: 'Amazon Music' }
];

export const MusicPage = () => {
  const [tracks, setTracks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Audio feature sliders
  const [minEnergy, setMinEnergy] = useState(0.0);
  const [minValence, setMinValence] = useState(0.0);
  const [minDanceability, setMinDanceability] = useState(0.0);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const glist = await musicService.getGenres();
        setGenres(['All', ...glist]);
      } catch (err) {
        console.error('Failed fetching music genres:', err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMusic = async () => {
      setLoading(true);
      try {
        let data = [];
        if (minEnergy > 0 || minValence > 0 || minDanceability > 0) {
          data = await musicService.filterByAudio({
            min_energy: minEnergy,
            min_valence: minValence,
            min_danceability: minDanceability,
            limit: 48
          });
        } else {
          data = await musicService.getMusic({
            limit: 48,
            genre: selectedGenre !== 'All' ? selectedGenre : undefined,
            search: searchQuery.trim() || undefined
          });
        }
        setTracks(data);
      } catch (err) {
        console.error('Failed fetching tracks:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchMusic, 250);
    return () => clearTimeout(debounceTimer);
  }, [selectedGenre, searchQuery, minEnergy, minValence, minDanceability]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Music className="w-8 h-8 text-brand-cyan" /> Music Catalog & Audio Posters
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explore 1,300+ tracks with DSP acoustic features, album cover artwork, and direct streaming links
          </p>
        </div>

        {/* Search & DSP Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks, artists, albums..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan transition-colors"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-2xl glass-panel flex items-center gap-2 text-xs font-semibold transition-all ${
              showFilters ? 'bg-brand-cyan/20 border-brand-cyan text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-cyan" />
            <span className="hidden sm:inline">Audio DSP</span>
          </button>
        </div>
      </div>

      {/* Expandable Audio DSP Filter Panel */}
      {showFilters && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/60 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-cyan" /> Parametric Audio Thresholds
            </h3>
            <button
              onClick={() => { setMinEnergy(0); setMinValence(0); setMinDanceability(0); }}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Energy Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Min Energy</span>
                <span className="text-white font-mono">{Math.round(minEnergy * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={minEnergy}
                onChange={(e) => setMinEnergy(parseFloat(e.target.value))}
                className="w-full accent-brand-purple"
              />
            </div>

            {/* Valence Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-rose-400" /> Min Valence (Mood)</span>
                <span className="text-white font-mono">{Math.round(minValence * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={minValence}
                onChange={(e) => setMinValence(parseFloat(e.target.value))}
                className="w-full accent-brand-cyan"
              />
            </div>

            {/* Danceability Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-brand-purple" /> Min Danceability</span>
                <span className="text-white font-mono">{Math.round(minDanceability * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={minDanceability}
                onChange={(e) => setMinDanceability(parseFloat(e.target.value))}
                className="w-full accent-brand-violet"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Bars Section */}
      <div className="space-y-3">
        {/* Streaming Services Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scroll">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 mr-1">
            <Radio className="w-3.5 h-3.5 text-emerald-400" /> Platform:
          </span>
          {MUSIC_PLATFORM_FILTERS.map((plat) => {
            const isSelected = selectedPlatform.toLowerCase() === plat.id.toLowerCase();
            return (
              <button
                key={plat.id}
                onClick={() => setSelectedPlatform(plat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-dark-900 font-bold shadow-md shadow-emerald-500/25 scale-[1.02]'
                    : 'glass-card text-slate-300 hover:text-white'
                }`}
              >
                {plat.name}
              </button>
            );
          })}
        </div>

        {/* Genre Filter Scroll Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scroll">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 mr-1">
            <Music className="w-3.5 h-3.5 text-brand-cyan" /> Genre:
          </span>
          {genres.map((g) => {
            const isSelected = selectedGenre.toLowerCase() === g.toLowerCase();
            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-brand-cyan text-dark-900 font-bold shadow-md shadow-brand-cyan/30'
                    : 'glass-card text-slate-300 hover:text-white'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Track Grid */}
      {loading ? (
        <GridSkeleton count={12} />
      ) : tracks.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center my-8">
          <Disc className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Music Tracks Found</h3>
          <p className="text-sm text-slate-400">Try adjusting your genre or audio filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      )}

    </div>
  );
};
