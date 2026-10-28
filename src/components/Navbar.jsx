import React from 'react';
import { Volume2, VolumeX, Award, Flame, Star, Home, Sparkles } from 'lucide-react';
import { AVATARS_LIST } from '../utils/storage';
import { sounds } from '../utils/soundEffects';

export default function Navbar({
  userData,
  currentGame,
  onNavigateHome,
  onOpenCabinet,
  onOpenAvatarPicker,
  onToggleSound,
}) {
  const currentAvatar = AVATARS_LIST.find(a => a.id === userData.selectedAvatar) || AVATARS_LIST[0];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-4 border-amber-100 shadow-sm px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { sounds.playClick(); onNavigateHome(); }}>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-2xl shadow-[0_4px_0_0_#d97706] transform hover:rotate-6 transition-transform">
            ⌨️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
                Typing<span className="text-pink-500">Games</span>
              </span>
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <p className="text-xs text-slate-500 font-quicksand font-bold hidden sm:block">
              Fun &amp; Playful Typing Adventures!
            </p>
          </div>
        </div>

        {/* Right Action Counters & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Home button (if in game) */}
          {currentGame && (
            <button
              onClick={() => { sounds.playClick(); onNavigateHome(); }}
              className="btn-fun bg-white border-2 border-slate-200 hover:border-pink-300 text-slate-700 px-3 py-2 text-sm sm:text-base flex items-center gap-1.5"
              title="Back to Game Menu"
            >
              <Home className="w-4 h-4 text-pink-500" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
          )}

          {/* Stars Pill */}
          <div 
            className="flex items-center gap-1.5 bg-amber-100/90 border-2 border-amber-300 text-amber-900 px-3 py-1.5 rounded-2xl font-black text-sm sm:text-base shadow-sm"
            title="Total Stars Earned"
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-400 animate-pulse" />
            <span>{userData.stars || 0}</span>
          </div>

          {/* Streak Flame */}
          <div 
            className="flex items-center gap-1.5 bg-orange-100/90 border-2 border-orange-300 text-orange-900 px-3 py-1.5 rounded-2xl font-black text-sm sm:text-base shadow-sm"
            title="Daily Streak!"
          >
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 fill-orange-500 animate-bounce" />
            <span className="hidden xs:inline">{userData.streak || 1}d</span>
            <span className="xs:hidden">{userData.streak || 1}</span>
          </div>

          {/* Reward Cabinet / Badges */}
          <button
            onClick={() => { sounds.playClick(); onOpenCabinet(); }}
            className="btn-fun bg-purple-100 border-2 border-purple-300 hover:bg-purple-200 text-purple-900 px-3 py-1.5 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-1.5"
            title="View Badges &amp; Trophies"
          >
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <span className="hidden sm:inline">Badges</span>
            <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full font-black">
              {userData.unlockedBadges?.length || 0}
            </span>
          </button>

          {/* Avatar Selector */}
          <button
            onClick={() => { sounds.playClick(); onOpenAvatarPicker(); }}
            className="btn-fun w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border-2 border-slate-200 hover:border-pink-400 flex items-center justify-center text-xl shadow-sm"
            title="Choose your Mascot Avatar"
          >
            <span>{currentAvatar.emoji}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleSound();
            }}
            className={`btn-fun w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 flex items-center justify-center transition-colors ${
              userData.soundEnabled 
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
            title={userData.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {userData.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>

        </div>
      </div>
    </header>
  );
}
