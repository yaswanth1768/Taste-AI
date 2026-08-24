import React, { useState, useEffect } from 'react';
import { Search, Filter, Film, Tv, SlidersHorizontal, Sparkles } from 'lucide-react';
import { movieService } from '../services/movieService';
import { MovieGrid } from '../components/movies/MovieGrid';

const OTT_FILTERS = [
  { id: 'All', name: 'All Streaming' },
  { id: 'Netflix', name: 'Netflix', color: 'hover:border-red-500' },
  { id: 'Prime Video', name: 'Prime Video', color: 'hover:border-sky-500' },
  { id: 'Disney+', name: 'Disney+', color: 'hover:border-blue-500' },
  { id: 'Apple TV+', name: 'Apple TV+', color: 'hover:border-slate-400' },
  { id: 'Max', name: 'Max (HBO)', color: 'hover:border-purple-500' },
];

export const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedOtt, setSelectedOtt] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const glist = await movieService.getGenres();
        setGenres(['All', ...glist]);
      } catch (err) {
        console.error('Failed fetching genres:', err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = {
          limit: 48,
          genre: selectedGenre !== 'All' ? selectedGenre : undefined,
          ott: selectedOtt !== 'All' ? selectedOtt : undefined,
          search: searchQuery.trim() || undefined
        };
        const data = await movieService.getMovies(params);
        setMovies(data);
      } catch (err) {
        console.error('Failed fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchMovies, 250);
    return () => clearTimeout(debounceTimer);
  }, [selectedGenre, selectedOtt, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Film className="w-8 h-8 text-brand-purple" /> Movie Catalog & Streaming
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explore 500+ movies with content vectors, high-res posters, and OTT platform availability
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, directors..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-purple transition-colors"
          />
        </div>
      </div>

      {/* Filter Bars Section */}
      <div className="space-y-4">
        
        {/* OTT Streaming Platform Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scroll">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 mr-1">
            <Tv className="w-3.5 h-3.5 text-brand-cyan" /> OTT Platform:
          </span>
          {OTT_FILTERS.map((ott) => {
            const isSelected = selectedOtt.toLowerCase() === ott.id.toLowerCase();
            return (
              <button
                key={ott.id}
                onClick={() => setSelectedOtt(ott.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-cyan text-dark-900 font-bold shadow-md shadow-brand-cyan/25 scale-[1.02]'
                    : 'glass-card text-slate-300 hover:text-white'
                }`}
              >
                <span>{ott.name}</span>
              </button>
            );
          })}
        </div>

        {/* Genre Filter Scroll Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scroll">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 mr-1">
            <Film className="w-3.5 h-3.5 text-brand-purple" /> Genre:
          </span>
          {genres.map((g) => {
            const isSelected = selectedGenre.toLowerCase() === g.toLowerCase();
            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/30 scale-[1.02]'
                    : 'glass-card text-slate-300 hover:text-white'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

      </div>

      {/* Active Filter Indicators */}
      {(selectedGenre !== 'All' || selectedOtt !== 'All' || searchQuery) && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Filtering by:</span>
          {selectedGenre !== 'All' && (
            <span className="px-2 py-0.5 rounded-md bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
              Genre: {selectedGenre}
            </span>
          )}
          {selectedOtt !== 'All' && (
            <span className="px-2 py-0.5 rounded-md bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              OTT: {selectedOtt}
            </span>
          )}
          {searchQuery && (
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white">
              Search: "{searchQuery}"
            </span>
          )}
          <button
            onClick={() => { setSelectedGenre('All'); setSelectedOtt('All'); setSearchQuery(''); }}
            className="text-slate-400 hover:text-white underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Movie Grid */}
      <MovieGrid 
        movies={movies} 
        loading={loading} 
        emptyMessage={`No movies found for ${selectedOtt !== 'All' ? `streaming on ${selectedOtt}` : 'your criteria'}. Try clearing filters.`} 
      />

    </div>
  );
};
