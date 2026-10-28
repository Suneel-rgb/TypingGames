import React from 'react';
import { X, Check } from 'lucide-react';
import { AVATARS_LIST } from '../utils/storage';
import { sounds } from '../utils/soundEffects';

export default function AvatarPickerModal({ isOpen, onClose, selectedAvatarId, onSelectAvatar }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-4 border-pink-200 shadow-2xl p-6 text-center">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <h3 className="text-2xl font-black text-slate-800">Choose Your Buddy</h3>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <p className="text-sm text-slate-600 font-quicksand font-semibold mb-6">
          Pick your favorite mascot to cheer you on while you type!
        </p>

        {/* Avatars Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {AVATARS_LIST.map((avatar) => {
            const isSelected = avatar.id === selectedAvatarId;

            return (
              <button
                key={avatar.id}
                onClick={() => {
                  sounds.playPop();
                  onSelectAvatar(avatar.id);
                }}
                className={`group relative p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-pink-100 border-2 border-pink-500 scale-105 shadow-md'
                    : 'bg-slate-50 border-2 border-slate-100 hover:bg-pink-50/50 hover:border-pink-200'
                }`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {avatar.emoji}
                </span>
                <span className="text-[11px] font-bold text-slate-700 mt-1 truncate max-w-full">
                  {avatar.name.split(' ')[0]}
                </span>
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center shadow">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="btn-fun-pink w-full py-3 text-base"
        >
          Let's Go!
        </button>

      </div>
    </div>
  );
}
