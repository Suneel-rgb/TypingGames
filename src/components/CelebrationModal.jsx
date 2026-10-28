import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="relative w-full max-w-lg bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-6 sm:p-8 text-center overflow-hidden"
        >
          {/* Background glow circle */}
          <div className="absolute -top-16 -left-16 w-40 h-40 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-pink-200/50 rounded-full blur-2xl pointer-events-none" />

          {/* Mascot celebration icon */}
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-pink-500 shadow-[0_6px_0_0_#d97706] text-4xl mb-3"
          >
            🎉
          </motion.div>

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
                <motion.div
                  key={starNum}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: isEarned ? 1.15 : 0.9, rotate: 0 }}
                  transition={{ delay: 0.2 + starNum * 0.15, type: 'spring', stiffness: 500, damping: 15 }}
                  className={`transform ${
                    isEarned
                      ? 'text-amber-400 drop-shadow-[0_4px_8px_rgba(251,191,36,0.6)]'
                      : 'text-slate-200'
                  }`}
                >
                  <Star
                    className={`w-12 h-12 ${
                      isEarned ? 'fill-amber-400' : 'fill-slate-200'
                    }`}
                  />
                </motion.div>
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
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="mb-6 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-300 flex items-center gap-3"
            >
              <span className="text-3xl">🏅</span>
              <div className="text-left flex-1">
                <div className="text-xs font-black text-purple-900 uppercase">New Badge Unlocked!</div>
                <div className="text-sm font-bold text-slate-800">{newBadges[0].title} (+5 Stars)</div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { sounds.playClick(); onPlayAgain(); }}
              className="btn-fun-primary px-6 py-3 text-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { sounds.playClick(); onBackToMenu(); }}
              className="btn-fun bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-6 py-3 text-lg flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5 text-slate-500" />
              <span>Game Menu</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
