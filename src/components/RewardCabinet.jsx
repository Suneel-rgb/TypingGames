import React from 'react';
import { X, Award, Star, Lock, CheckCircle2 } from 'lucide-react';
import { BADGES_LIST } from '../utils/storage';
import { sounds } from '../utils/soundEffects';

export default function RewardCabinet({ isOpen, onClose, userData }) {
  if (!isOpen) return null;

  const unlockedSet = new Set(userData.unlockedBadges || []);
  const progressPercent = Math.round((unlockedSet.size / BADGES_LIST.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border-4 border-purple-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
              🏆
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black">Trophy &amp; Badge Cabinet</h2>
              <p className="text-white/90 text-sm font-quicksand font-semibold">
                Collect shiny badges and earn bonus stars!
              </p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm font-bold text-purple-900 mb-1">
              <span>Collection Progress</span>
              <span>{unlockedSet.size} of {BADGES_LIST.length} Unlocked ({progressPercent}%)</span>
            </div>
            <div className="w-full h-3.5 bg-purple-200 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl font-bold text-sm border border-amber-300">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>+5 Stars per Badge</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {BADGES_LIST.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col items-center text-center ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-white to-purple-50/60 border-purple-300 shadow-md transform hover:-translate-y-1'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                {/* Status indicator pill */}
                <div className="absolute top-3 right-3">
                  {isUnlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Badge Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 ${
                    isUnlocked
                      ? `bg-gradient-to-tr ${badge.color} text-white shadow-lg`
                      : 'bg-slate-200 grayscale text-slate-400'
                  }`}
                >
                  {badge.icon}
                </div>

                {/* Badge Info */}
                <h3 className="font-black text-slate-800 text-base mb-1">
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-600 font-quicksand font-medium leading-relaxed">
                  {badge.desc}
                </p>

                {isUnlocked && (
                  <span className="mt-3 inline-block bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Unlocked ⭐
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="btn-fun-purple px-6 py-2.5 text-base"
          >
            Awesome! Close Cabinet
          </button>
        </div>

      </div>
    </div>
  );
}
