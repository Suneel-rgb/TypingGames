import React from 'react';
import { Star, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function GameCard({
  id,
  title,
  subtitle,
  tagline,
  difficulty,
  difficultyColor,
  icon,
  gradient,
  shadowColor,
  focusSkill,
  highScore = 0,
  onPlay,
}) {
  return (
    <div
      className={`card-kid relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border-4 border-white flex flex-col justify-between`}
    >
      {/* Top Banner Gradient & Icon */}
      <div className={`p-6 bg-gradient-to-br ${gradient} text-white relative`}>
        {/* Decorative background shapes */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          {/* Difficulty pill */}
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${difficultyColor}`}>
            {difficulty}
          </span>

          {/* High score badge */}
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Best: {highScore}</span>
          </div>
        </div>

        {/* Big 3D Animated Game Icon */}
        <div className="flex justify-center my-2">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            {icon}
          </div>
        </div>

        <h3 className="text-2xl font-black text-center text-white drop-shadow-sm">
          {title}
        </h3>
        <p className="text-white/90 text-center text-xs font-quicksand font-bold mt-1">
          {subtitle}
        </p>
      </div>

      {/* Body description & Focus Skill */}
      <div className="p-6 bg-white flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-xl mb-2">
            🎯 {focusSkill}
          </div>
          <p className="text-slate-600 text-sm font-quicksand font-semibold leading-relaxed">
            {tagline}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onPlay(id);
          }}
          className={`btn-fun w-full py-3.5 text-base sm:text-lg font-black text-white flex items-center justify-center gap-2 rounded-2xl shadow-[0_6px_0_0_${shadowColor}] active:shadow-[0_2px_0_0_${shadowColor}] bg-gradient-to-r ${gradient}`}
        >
          <span>Play Now</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
