import React from 'react';
import { Activity, Zap, Heart, Disc, Volume2, Radio, Music } from 'lucide-react';

export const AudioFeatureRadar = ({ features = {} }) => {
  const metrics = [
    { key: 'energy', label: 'Energy', icon: Zap, color: 'from-amber-500 to-orange-500', value: features.energy || 0.5, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'danceability', label: 'Danceability', icon: Activity, color: 'from-brand-purple to-brand-violet', value: features.danceability || 0.5, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'valence', label: 'Valence (Mood)', icon: Heart, color: 'from-brand-cyan to-blue-500', value: features.valence || 0.5, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'acousticness', label: 'Acousticness', icon: Radio, color: 'from-emerald-500 to-teal-500', value: features.acousticness || 0.5, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'instrumentalness', label: 'Instrumental', icon: Disc, color: 'from-rose-500 to-pink-500', value: features.instrumentalness || 0.0, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'tempo', label: 'Tempo', icon: Music, color: 'from-purple-500 to-indigo-500', value: Math.min(1.0, (features.tempo || 120) / 180), format: () => `${Math.round(features.tempo || 120)} BPM` },
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-800">
      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
        <Activity className="w-4 h-4 text-brand-cyan" /> Audio Signature & DSP Profile
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.key} className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/40 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{m.label}</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">{m.format(m.value)}</span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-700`}
                  style={{ width: `${Math.max(5, Math.min(100, m.value * 100))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
