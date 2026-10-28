import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, Home, Sparkles, Zap, Target } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function CelebrationModal({
  isOpen,
  title = "Round Complete!",
  score = 0,
  starsEarned = 3,
  wpm = 0,
  accuracy = 100,
  wordsTyped = 0,
  newBadges = [],
  onPlayAgain,
  onBackToMenu,
}) {
  useEffect(() => {
    if (isOpen) {
      sounds.playVictory();
      
      // Fire double confetti cannon
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-6 sm:p-8 text-center overflow-hidden">
        
        {/* Background glow circle */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-pink-200/50 rounded-full blur-2xl pointer-events-none" />

        {/* Mascot / Trophy icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-pink-500 shadow-[0_6px_0_0_#d97706] text-4xl mb-3 animate-bounce">
          🎉
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-slate-600 font-quicksand font-bold text-sm sm:text-base mb-6">
          Super duper typing work! You are getting faster every day!
        </p>

        {/* Star Rating Animation */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map((starNum) => {
            const isEarned = starNum <= starsEarned;
            return (
              <div
                key={starNum}
                className={`transform transition-all duration-300 ${
                  isEarned
                    ? 'scale-110 text-amber-400 drop-shadow-[0_4px_8px_rgba(251,191,36,0.6)]'
                    : 'scale-90 text-slate-200'
                }`}
              >
                <Star
                  className={`w-12 h-12 ${
                    isEarned ? 'fill-amber-400 animate-pulse' : 'fill-slate-200'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200">
          <div className="flex flex-col items-center">
            <span className="text-xs text-amber-800 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Score
            </span>
            <span className="text-2xl font-black text-slate-800">{score}</span>
          </div>

          <div className="flex flex-col items-center border-x-2 border-amber-200 px-2">
            <span className="text-xs text-amber-800 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-orange-500" /> Speed
            </span>
            <span className="text-2xl font-black text-slate-800">{wpm} <span className="text-xs font-semibold text-slate-500">WPM</span></span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-amber-800 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-500" /> Accuracy
            </span>
            <span className="text-2xl font-black text-emerald-600">{accuracy}%</span>
          </div>
        </div>

        {/* New Badges notification */}
        {newBadges && newBadges.length > 0 && (
          <div className="mb-6 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-300 flex items-center gap-3">
            <span className="text-3xl">🏅</span>
            <div className="text-left flex-1">
              <div className="text-xs font-black text-purple-900 uppercase">New Badge Unlocked!</div>
              <div className="text-sm font-bold text-slate-800">{newBadges[0].title} (+5 Stars)</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => { sounds.playClick(); onPlayAgain(); }}
            className="btn-fun-primary px-6 py-3 text-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </button>
          
          <button
            onClick={() => { sounds.playClick(); onBackToMenu(); }}
            className="btn-fun bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-6 py-3 text-lg flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5 text-slate-500" />
            <span>Game Menu</span>
          </button>
        </div>

      </div>
    </div>
  );
}
