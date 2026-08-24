import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, Music, Compass, Heart, Sparkles, User as UserIcon, LogOut, Menu, X, Shield, Smile, Search, Tv } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { movieService } from '../../services/movieService';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoodOpen, setIsMoodOpen] = useState(false);

  // Global Quick Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Sparkles },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Music', path: '/music', icon: Music },
    { name: 'AI Discovery', path: '/recommendations', icon: Compass },
    { name: 'Favorites', path: '/favorites', icon: Heart },
    { name: 'Admin', path: '/admin', icon: Shield },
  ];

  const moods = ['Happy', 'Sad', 'Workout', 'Relax', 'Focus', 'Romantic'];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const movies = await movieService.getMovies({ search: query, limit: 5 });
        setResults(movies);
      } catch (err) {
        console.error('Quick search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMood = (mood) => {
    setIsMoodOpen(false);
    navigate(`/recommendations?tab=mood&mood=${mood}`);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-purple via-brand-violet to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-purple/30 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Taste<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">AI</span>
              </span>
              <span className="block text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                Recommendation Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-brand-purple/15 text-white border border-brand-purple/30 shadow-sm shadow-brand-purple/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-brand-purple' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Global Quick Search & Right Actions */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0" ref={searchRef}>
            
            {/* Quick Search Bar */}
            <div className="relative">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                  placeholder="Quick search movies..."
                  className="w-48 xl:w-56 pl-9 pr-3 py-1.5 rounded-xl glass-panel text-xs text-white placeholder-slate-400 focus:outline-none focus:w-64 focus:border-brand-purple transition-all duration-300"
                />
              </div>

              {/* Auto-suggest Search Dropdown */}
              {searchOpen && query.trim() && (
                <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-2 shadow-2xl border border-slate-700/80 z-50 animate-fade-in space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Matching Movies
                  </div>
                  {searchLoading ? (
                    <div className="p-3 text-xs text-slate-400 text-center">Searching catalog...</div>
                  ) : results.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">No movies found</div>
                  ) : (
                    results.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          navigate(`/movies/${m.id}`);
                          setSearchOpen(false);
                          setQuery('');
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-purple/20 cursor-pointer transition-colors group"
                      >
                        <img
                          src={m.poster_path || m.artwork_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100&q=80"}
                          alt={m.title}
                          className="w-8 h-11 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="overflow-hidden flex-grow">
                          <div className="text-xs font-bold text-white group-hover:text-brand-cyan truncate">{m.title}</div>
                          <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            {m.streaming_platforms?.[0] ? (
                              <span className="text-brand-cyan font-semibold">{m.streaming_platforms[0].name}</span>
                            ) : (
                              <span>{m.genres?.[0] || 'Cinema'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Quick Mood Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoodOpen(!isMoodOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-colors"
              >
                <Smile className="w-3.5 h-3.5 text-brand-amber" />
                <span>Mood</span>
              </button>

              {isMoodOpen && (
                <div className="absolute right-0 mt-2 w-44 glass-panel rounded-2xl p-2 shadow-2xl border border-slate-700/70 z-50 animate-fade-in">
                  <div className="text-[11px] font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                    Choose Your Vibe
                  </div>
                  {moods.map((m) => (
                    <button
                      key={m}
                      onClick={() => handleSelectMood(m)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-brand-purple/20 hover:text-white transition-colors"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth / Profile State */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/onboarding"
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50"
                  title="Adjust Taste Preferences"
                >
                  Taste Quiz
                </Link>
                <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-violet to-brand-cyan flex items-center justify-center font-bold text-xs text-white shadow-md">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-xl transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-violet hover:opacity-90 shadow-lg shadow-brand-purple/25 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-800/80 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-medium ${
                  active ? 'bg-brand-purple/20 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 text-brand-purple" />
                {link.name}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-2 pt-2">
                <span className="text-sm text-slate-300 font-medium">{user?.name}</span>
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/80"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-purple"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
