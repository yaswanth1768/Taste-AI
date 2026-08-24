import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { GlobalPlayerBar } from './components/common/GlobalPlayerBar';

// Pages
import { Home } from './pages/Home';
import { Onboarding } from './pages/Onboarding';
import { Movies } from './pages/Movies';
import { MovieDetails } from './pages/MovieDetails';
import { MusicPage } from './pages/Music';
import { MusicDetails } from './pages/MusicDetails';
import { Recommendations } from './pages/Recommendations';
import { Favorites } from './pages/Favorites';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#07090e] text-slate-100 selection:bg-brand-purple selection:text-white">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movies/:id" element={<MovieDetails />} />
                <Route path="/music" element={<MusicPage />} />
                <Route path="/music/:id" element={<MusicDetails />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>
            <Footer />
            <GlobalPlayerBar />
          </div>
        </Router>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
