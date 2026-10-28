import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Gauge, Flag, RotateCcw, Home, Zap, Sparkles } from 'lucide-react';
import { RACER_WORDS, getRandomItem } from '../utils/words';
import { sounds } from '../utils/soundEffects';
import VirtualKeyboard from '../components/VirtualKeyboard';

const TRACK_LENGTH = 100; // 100% distance

export default function SpeedyRacer({ onComplete, onBackToMenu }) {
  // Difficulty levels and AI speeds (WPM)
  const [difficulty, setDifficulty] = useState('novice'); // 'novice' | 'pro' | 'champion'
  const aiWPM = difficulty === 'novice' ? 14 : difficulty === 'pro' ? 24 : 36;

  // Race progress (0 to 100%)
  const [playerProgress, setPlayerProgress] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);
  const [isRacing, setIsRacing] = useState(true);
  const [winner, setWinner] = useState(null); // 'player' | 'ai'

  // Words queue
  const [wordList, setWordList] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedLetters, setTypedLetters] = useState('');
  const [isTypo, setIsTypo] = useState(false);
  
  // Stats
  const [startTime, setStartTime] = useState(null);
  const [liveWPM, setLiveWPM] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [correctKeys, setCorrectKeys] = useState(0);
  const [turboActive, setTurboActive] = useState(false);

  // Virtual keyboard state
  const [lastPressedKey, setLastPressedKey] = useState('');

  const containerRef = useRef(null);

  // Initialize word list (15 words per race)
  const initRace = (newDiff = difficulty) => {
    const words = [];
    for (let i = 0; i < 18; i++) {
      words.push(getRandomItem(RACER_WORDS));
    }
    setDifficulty(newDiff);
    setWordList(words);
    setCurrentWordIndex(0);
    setTypedLetters('');
    setIsTypo(false);
    setPlayerProgress(0);
    setAiProgress(0);
    setWinner(null);
    setIsRacing(true);
    setStartTime(Date.now());
    setLiveWPM(0);
    setTotalKeys(0);
    setCorrectKeys(0);
    setTurboActive(false);
    if (containerRef.current) containerRef.current.focus();
  };

  useEffect(() => {
    initRace(difficulty);
  }, []);

  // AI Car progress timer
  useEffect(() => {
    if (!isRacing || winner) return;

    // AI advances gradually based on aiWPM
    // If aiWPM is 20 words per minute, 18 words take ~54 seconds.
    const intervalMs = 200;
    const totalWords = 16;
    const raceDurationSeconds = (totalWords / aiWPM) * 60;
    const progressPerInterval = (100 / (raceDurationSeconds * 1000 / intervalMs));

    const interval = setInterval(() => {
      setAiProgress(prev => {
        const next = prev + progressPerInterval;
        if (next >= TRACK_LENGTH) {
          setWinner('ai');
          setIsRacing(false);
          sounds.playError();
          return TRACK_LENGTH;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isRacing, winner, aiWPM]);

  // Current active word & next letter
  const currentWord = wordList[currentWordIndex] || '';
  const nextTargetChar = currentWord[typedLetters.length] || ' ';

  // Live WPM calculation
  useEffect(() => {
    if (!startTime || !isRacing) return;
    const timer = setInterval(() => {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      if (elapsedMinutes > 0.05) {
        const currentSpeed = Math.round((correctKeys / 5) / elapsedMinutes);
        setLiveWPM(currentSpeed);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [startTime, isRacing, correctKeys]);

  // Handle Keystrokes
  const handleKeyDown = (e) => {
    if (!isRacing || winner) return;
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

    const key = e.key.toLowerCase();
    setLastPressedKey(key);
    setTotalKeys(t => t + 1);

    const expectedChar = currentWord[typedLetters.length];

    if (key === expectedChar) {
      // Correct letter
      setIsTypo(false);
      sounds.playSuccess();
      setCorrectKeys(c => c + 1);

      const updatedTyped = typedLetters + key;
      setTypedLetters(updatedTyped);

      // Check if word is finished
      if (updatedTyped.length === currentWord.length) {
        sounds.playTurbo();
        setTurboActive(true);
        setTimeout(() => setTurboActive(false), 800);

        // Advance player car
        const nextWordIndex = currentWordIndex + 1;
        setCurrentWordIndex(nextWordIndex);
        setTypedLetters('');

        const progressPercent = Math.min(100, Math.round((nextWordIndex / (wordList.length - 2)) * 100));
        setPlayerProgress(progressPercent);

        if (progressPercent >= TRACK_LENGTH) {
          // Player won the Grand Prix!
          setWinner('player');
          setIsRacing(false);
          sounds.playVictory();

          const elapsedMinutes = Math.max(0.1, (Date.now() - startTime) / 60000);
          const finalWpm = Math.round((correctKeys / 5) / elapsedMinutes);
          const finalAcc = totalKeys > 0 ? Math.round((correctKeys / totalKeys) * 100) : 100;

          setTimeout(() => {
            onComplete({
              gameId: 'speedyRacer',
              score: Math.round(finalWpm * 10 + finalAcc),
              starsEarned: finalWpm >= 25 ? 3 : 2,
              wordsTyped: nextWordIndex,
              keysPressed: totalKeys,
              accuracy: finalAcc,
              wpm: finalWpm
            });
          }, 1200);
        }
      }
    } else {
      // Typo
      sounds.playError();
      setIsTypo(true);
    }
  };

  // If AI won first
  useEffect(() => {
    if (winner === 'ai') {
      const elapsedMinutes = Math.max(0.1, (Date.now() - startTime) / 60000);
      const finalWpm = Math.round((correctKeys / 5) / elapsedMinutes);
      const finalAcc = totalKeys > 0 ? Math.round((correctKeys / totalKeys) * 100) : 100;

      setTimeout(() => {
        onComplete({
          gameId: 'speedyRacer',
          score: Math.round(finalWpm * 5),
          starsEarned: 1,
          wordsTyped: currentWordIndex,
          keysPressed: totalKeys,
          accuracy: finalAcc,
          wpm: finalWpm
        });
      }, 1500);
    }
  }, [winner]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none flex flex-col items-center w-full max-w-5xl mx-auto px-2 select-none"
    >
      {/* Top Controls & Status Bar */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl border-4 border-blue-200 shadow-md p-3 sm:p-4 mb-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Title and Difficulty */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-sm">
            🏎️
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
              Speedy Racer
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              {[
                { id: 'novice', label: 'Turtle (14 WPM)' },
                { id: 'pro', label: 'Cheetah (24 WPM)' },
                { id: 'champion', label: 'Rocket (36 WPM)' }
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => { sounds.playClick(); initRace(d.id); }}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    difficulty === d.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-blue-50 border-2 border-blue-200 px-3 py-1.5 rounded-2xl text-blue-900 font-black">
            <Gauge className="w-5 h-5 text-blue-600 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xl">{liveWPM}</span>
            <span className="text-xs font-bold text-blue-600">WPM</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-200 px-3 py-1.5 rounded-2xl text-amber-900 font-black">
            <Flag className="w-5 h-5 text-amber-600" />
            <span className="text-xl">{playerProgress}%</span>
          </div>
        </div>

        {/* Restart / Back */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { sounds.playClick(); initRace(); }}
            className="btn-fun bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl"
            title="Restart Race"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { sounds.playClick(); onBackToMenu(); }}
            className="btn-fun bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl"
            title="Back to Dashboard"
          >
            <Home className="w-4 h-4 text-slate-600" />
          </button>
        </div>

      </div>

      {/* Racetrack Visual Container */}
      <div className="relative w-full rounded-3xl bg-gradient-to-b from-sky-200 via-emerald-100 to-emerald-200 border-4 border-white shadow-xl p-4 overflow-hidden mb-4">
        
        {/* Scenery details: Trees, Hills */}
        <div className="flex justify-between items-end px-6 text-3xl opacity-50 mb-2 pointer-events-none select-none">
          <span>🌲</span>
          <span>🌳</span>
          <span>☁️</span>
          <span>🌲</span>
          <span>🌳</span>
        </div>

        {/* Track Tarmac */}
        <div className="relative bg-slate-800 rounded-2xl p-4 border-4 border-slate-600 shadow-inner">
          
          {/* Finish Line Checkered Strip */}
          <div className="absolute top-0 bottom-0 right-8 w-6 bg-[repeating-linear-gradient(45deg,#fff,#fff_8px,#000_8px,#000_16px)] opacity-90 z-10" />

          {/* Lane 1: Rival AI */}
          <div className="relative h-14 border-b-2 border-dashed border-slate-500/80 flex items-center mb-2">
            <span className="absolute left-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Rival Car 🦊
            </span>
            {/* AI Car */}
            <div
              className="absolute transition-all duration-300 ease-out flex items-center"
              style={{ left: `calc(${aiProgress}% * 0.85)` }}
            >
              <div className="relative text-3xl transform -scale-x-100 filter drop-shadow-md">
                🏎️
              </div>
              <span className="text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full ml-1 whitespace-nowrap">
                Rival
              </span>
            </div>
          </div>

          {/* Lane 2: Player Racer */}
          <div className="relative h-16 flex items-center">
            <span className="absolute left-2 text-[10px] font-black uppercase tracking-wider text-amber-400">
              Your Racer ⭐
            </span>
            {/* Player Car with Nitro Flames */}
            <div
              className="absolute transition-all duration-200 ease-out flex items-center"
              style={{ left: `calc(${playerProgress}% * 0.85)` }}
            >
              {/* Nitro booster flames */}
              {turboActive && (
                <div className="absolute -left-6 text-2xl animate-pulse">
                  🔥
                </div>
              )}
              <div className={`relative text-4xl filter drop-shadow-lg transition-transform ${turboActive ? 'scale-125' : ''}`}>
                🚗
              </div>
              <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full ml-1 whitespace-nowrap shadow">
                YOU
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Active Word Typing Box */}
      <div className="w-full bg-white rounded-3xl border-4 border-amber-300 shadow-lg p-5 mb-4 text-center relative overflow-hidden">
        
        {/* Upcoming words preview */}
        <div className="flex items-center justify-center gap-3 mb-3 overflow-hidden text-xs text-slate-400 font-bold uppercase">
          <span className="text-slate-500">Upcoming:</span>
          {wordList.slice(currentWordIndex + 1, currentWordIndex + 5).map((w, i) => (
            <span key={i} className="bg-slate-100 px-2.5 py-1 rounded-xl">
              {w}
            </span>
          ))}
        </div>

        {/* Current Big Word Display */}
        <div className={`inline-block py-2 px-6 rounded-2xl transition-transform ${isTypo ? 'animate-wiggle bg-rose-50' : 'bg-amber-50/70'}`}>
          <div className="text-4xl sm:text-5xl font-black tracking-widest font-mono select-none">
            {currentWord.split('').map((char, index) => {
              const isTyped = index < typedLetters.length;
              const isCurrent = index === typedLetters.length;

              return (
                <span
                  key={index}
                  className={`inline-block transition-colors ${
                    isTyped
                      ? 'text-emerald-500'
                      : isCurrent
                      ? isTypo
                        ? 'text-rose-500 underline decoration-rose-500'
                        : 'text-amber-500 underline decoration-amber-400 scale-110'
                      : 'text-slate-400'
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        <p className="text-xs font-bold text-slate-500 mt-2">
          Type the letters to accelerate your racer across the finish line! 🏁
        </p>

      </div>

      {/* On-screen Virtual Keyboard */}
      <VirtualKeyboard
        activeKey={nextTargetChar}
        lastPressedKey={lastPressedKey}
        isError={isTypo}
        showFingerHints={true}
      />

    </div>
  );
}
