import React from 'react';
import { Heart, Sparkles, Lightbulb } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-white/70 backdrop-blur-md border-t-4 border-amber-100 py-8 px-4 text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
        
        {/* Tip Box for Kids */}
        <div className="inline-flex items-center gap-2 bg-amber-100/80 border-2 border-amber-300 text-amber-900 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm">
          <Lightbulb className="w-5 h-5 text-amber-600 animate-bounce" />
          <span>Super Typist Tip: Rest your index fingers on the bumpy <strong>F</strong> and <strong>J</strong> keys!</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
          <span>Made with</span>
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
          <span>for curious little typists everywhere</span>
        </div>

        <p className="text-xs text-slate-400 font-quicksand">
          TypingGames &bull; Gamified Kids Learning &bull; Safe, Offline-first &amp; Ad-free
        </p>

      </div>
    </footer>
  );
}
