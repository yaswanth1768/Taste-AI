import React from 'react';
import { Smile, Frown, Dumbbell, Coffee, Target, Heart } from 'lucide-react';

const MOODS = [
  { id: 'Happy', name: 'Happy', icon: Smile, color: 'hover:border-amber-400/50 hover:bg-amber-400/10 text-amber-400', desc: 'Upbeat & feel-good' },
  { id: 'Sad', name: 'Melancholic', icon: Frown, color: 'hover:border-blue-400/50 hover:bg-blue-400/10 text-blue-400', desc: 'Deep & contemplative' },
  { id: 'Workout', name: 'Workout', icon: Dumbbell, color: 'hover:border-rose-400/50 hover:bg-rose-400/10 text-rose-400', desc: 'High energy & driving bpm' },
  { id: 'Relax', name: 'Relax', icon: Coffee, color: 'hover:border-emerald-400/50 hover:bg-emerald-400/10 text-emerald-400', desc: 'Acoustic & chill lo-fi' },
  { id: 'Focus', name: 'Focus', icon: Target, color: 'hover:border-brand-purple/50 hover:bg-brand-purple/10 text-brand-purple', desc: 'Ambient & mind-expanding' },
  { id: 'Romantic', name: 'Romantic', icon: Heart, color: 'hover:border-pink-400/50 hover:bg-pink-400/10 text-pink-400', desc: 'Warm & intimate ballads' },
];

export const MoodSelector = ({ selectedMood, onSelectMood }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {MOODS.map((m) => {
        const Icon = m.icon;
        const isSelected = selectedMood?.toLowerCase() === m.id.toLowerCase();
        return (
          <button
            key={m.id}
            onClick={() => onSelectMood(m.id)}
            className={`p-3.5 rounded-2xl glass-card text-left flex flex-col justify-between transition-all ${
              isSelected
                ? 'bg-brand-purple/20 border-brand-purple shadow-lg shadow-brand-purple/25 scale-[1.02]'
                : m.color
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className="w-5 h-5" />
              {isSelected && <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white">{m.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{m.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
