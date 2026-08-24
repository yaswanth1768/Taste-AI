import React from 'react';
import { Sparkles, Github, Heart, Database, Cpu, Layers } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full glass-panel border-t border-slate-800/80 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white font-sans">
                Taste<span className="text-brand-purple">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Production-ready hybrid movie & music recommendation engine powered by NLP content filtering, audio features engineering, and cross-domain intelligence.
            </p>
          </div>

          {/* Machine Learning Specs */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-brand-cyan" /> ML Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• CountVectorizer (5,000 features)</li>
              <li>• Cosine Similarity Matrix</li>
              <li>• Audio StandardScaler + NearestNeighbors</li>
              <li>• 5-Factor Weighted Hybrid Personalization</li>
            </ul>
          </div>

          {/* Dataset & Tech Stack */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-brand-purple" /> Data & Stack
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• TMDB 5000 Movies & Credits</li>
              <li>• HuggingFace jquigl/imdb-genres</li>
              <li>• Spotify Audio Attributes Dataset</li>
              <li>• FastAPI + PostgreSQL + React + Vite</li>
            </ul>
          </div>

          {/* Academic & Final Year Project Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-brand-emerald" /> Project Deliverable
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for final-year B.Tech CSE/AIML placement demonstration, portfolio showcase, and production deployment.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 TasteAI Recommender System. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span>Built with precision for AI & Entertainment Discovery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
