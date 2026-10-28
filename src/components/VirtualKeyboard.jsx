import React from 'react';
import { KEYBOARD_FINGER_MAP } from '../utils/words';

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

export default function VirtualKeyboard({
  activeKey = '',
  lastPressedKey = '',
  isError = false,
  showFingerHints = true
}) {
  const normActive = (activeKey || '').toLowerCase();
  const normPressed = (lastPressedKey || '').toLowerCase();

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-md p-3 sm:p-4 rounded-3xl border-4 border-slate-700/60 shadow-xl select-none">
      
      {/* Keyboard top indicator hint */}
      {showFingerHints && (
        <div className="flex items-center justify-between px-2 mb-2 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> Pinky
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Ring
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Middle
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> Index
            </span>
          </div>
          <span className="text-[11px] text-amber-300 hidden sm:inline">
            Home Row Keys: <strong className="text-white">A S D F &bull; J K L</strong>
          </span>
        </div>
      )}

      {/* Row 1 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-1.5">
        {KEYBOARD_ROWS[0].map((k) => {
          const isActive = normActive === k;
          const isPressed = normPressed === k;
          const fingerInfo = KEYBOARD_FINGER_MAP[k];

          return (
            <div
              key={k}
              className={`w-7 h-9 sm:w-10 sm:h-12 rounded-xl flex flex-col items-center justify-center font-black text-sm sm:text-base uppercase transition-all duration-75 relative ${
                isPressed
                  ? isError
                    ? 'bg-rose-500 text-white translate-y-1 shadow-none'
                    : 'bg-emerald-400 text-slate-900 translate-y-1 shadow-none scale-95'
                  : isActive
                  ? 'bg-amber-400 text-slate-950 -translate-y-1 ring-4 ring-amber-300 shadow-[0_4px_0_0_#d97706] animate-bounce'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 shadow-[0_3px_0_0_#1e293b]'
              }`}
            >
              <span>{k}</span>
              {/* Finger dot indicator */}
              {showFingerHints && fingerInfo && (
                <span className={`w-1.5 h-1.5 rounded-full ${fingerInfo.color} mt-0.5 opacity-80`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Row 2 (Home Row) */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-1.5">
        {KEYBOARD_ROWS[1].map((k) => {
          const isActive = normActive === k;
          const isPressed = normPressed === k;
          const fingerInfo = KEYBOARD_FINGER_MAP[k];
          const isHomeAnchor = k === 'f' || k === 'j';

          return (
            <div
              key={k}
              className={`w-7 h-9 sm:w-10 sm:h-12 rounded-xl flex flex-col items-center justify-center font-black text-sm sm:text-base uppercase transition-all duration-75 relative ${
                isPressed
                  ? isError
                    ? 'bg-rose-500 text-white translate-y-1 shadow-none'
                    : 'bg-emerald-400 text-slate-900 translate-y-1 shadow-none scale-95'
                  : isActive
                  ? 'bg-amber-400 text-slate-950 -translate-y-1 ring-4 ring-amber-300 shadow-[0_4px_0_0_#d97706] animate-bounce'
                  : isHomeAnchor
                  ? 'bg-slate-800/95 text-slate-100 border-2 border-indigo-500/60 shadow-[0_3px_0_0_#1e293b]'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 shadow-[0_3px_0_0_#1e293b]'
              }`}
            >
              <span>{k}</span>
              {/* Home bump indicator on F and J */}
              {isHomeAnchor && (
                <span className="w-2.5 h-0.5 bg-amber-400 rounded-full my-0.5" />
              )}
              {showFingerHints && fingerInfo && !isHomeAnchor && (
                <span className={`w-1.5 h-1.5 rounded-full ${fingerInfo.color} mt-0.5 opacity-80`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Row 3 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-1.5">
        {KEYBOARD_ROWS[2].map((k) => {
          const isActive = normActive === k;
          const isPressed = normPressed === k;
          const fingerInfo = KEYBOARD_FINGER_MAP[k];

          return (
            <div
              key={k}
              className={`w-7 h-9 sm:w-10 sm:h-12 rounded-xl flex flex-col items-center justify-center font-black text-sm sm:text-base uppercase transition-all duration-75 relative ${
                isPressed
                  ? isError
                    ? 'bg-rose-500 text-white translate-y-1 shadow-none'
                    : 'bg-emerald-400 text-slate-900 translate-y-1 shadow-none scale-95'
                  : isActive
                  ? 'bg-amber-400 text-slate-950 -translate-y-1 ring-4 ring-amber-300 shadow-[0_4px_0_0_#d97706] animate-bounce'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 shadow-[0_3px_0_0_#1e293b]'
              }`}
            >
              <span>{k}</span>
              {showFingerHints && fingerInfo && (
                <span className={`w-1.5 h-1.5 rounded-full ${fingerInfo.color} mt-0.5 opacity-80`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Row 4 (Spacebar) */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        <div
          className={`w-44 sm:w-60 h-8 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase transition-all duration-75 ${
            normPressed === ' '
              ? 'bg-emerald-400 text-slate-900 translate-y-1 shadow-none'
              : normActive === ' '
              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 shadow-[0_4px_0_0_#d97706] animate-pulse'
              : 'bg-slate-800 text-slate-400 border border-slate-700 shadow-[0_3px_0_0_#1e293b]'
          }`}
        >
          <span>Space</span>
        </div>
      </div>

    </div>
  );
}
