import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Volume2, Pause, Play, RotateCcw, Home, Sparkles, Flame } from 'lucide-react';
import { HOME_ROW_KEYS, ALPHABET_KEYS, EASY_WORDS, getRandomItem } from '../utils/words';
import { sounds } from '../utils/soundEffects';
import VirtualKeyboard from '../components/VirtualKeyboard';

const BALLOON_COLORS = [
  { bg: 'from-pink-400 to-rose-500', border: 'border-pink-300', text: 'text-white', shadow: 'shadow-pink-300' },
  { bg: 'from-sky-400 to-blue-500', border: 'border-sky-300', text: 'text-white', shadow: 'shadow-sky-300' },
  { bg: 'from-amber-400 to-yellow-500', border: 'border-amber-300', text: 'text-amber-950', shadow: 'shadow-amber-300' },
  { bg: 'from-emerald-400 to-teal-500', border: 'border-emerald-300', text: 'text-white', shadow: 'shadow-emerald-300' },
  { bg: 'from-purple-400 to-violet-500', border: 'border-purple-300', text: 'text-white', shadow: 'shadow-purple-300' },
  { bg: 'from-orange-400 to-red-400', border: 'border-orange-300', text: 'text-white', shadow: 'shadow-orange-300' }
];

export default function BalloonPop({ onComplete, onBackToMenu }) {
  // Game mode / difficulty: 'home_row' | 'alphabet' | 'words'
  const [mode, setMode] = useState('home_row');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [successfulHits, setSuccessfulHits] = useState(0);
  const [balloons, setBalloons] = useState([]);
  const [particles, setParticles] = useState([]);
  const [popTexts, setPopTexts] = useState([]);
  
  // Virtual keyboard state
  const [lastPressedKey, setLastPressedKey] = useState('');
  const [isKeyError, setIsKeyError] = useState(false);

  // Focus container for keyboard listener
  const containerRef = useRef(null);
  const nextIdRef = useRef(1);
  const animFrameRef = useRef(null);
  const lastSpawnTimeRef = useRef(Date.now());

  // Determine current active target key (the lowest/closest balloon to bottom or first active)
  const sortedBalloons = [...balloons].sort((a, b) => b.y - a.y);
  const activeBalloon = sortedBalloons[0];
  const activeTargetKey = activeBalloon ? activeBalloon.text[activeBalloon.typedIndex || 0] : '';

  // Spawn a new balloon
  const spawnBalloon = useCallback(() => {
    let text = '';
    if (mode === 'home_row') {
      text = getRandomItem(HOME_ROW_KEYS);
    } else if (mode === 'alphabet') {
      text = getRandomItem(ALPHABET_KEYS);
    } else {
      text = getRandomItem(EASY_WORDS);
    }

    const colorScheme = getRandomItem(BALLOON_COLORS);
    // Random horizontal position from 10% to 85%
    const x = Math.floor(Math.random() * 75) + 10;
    // Speed depends on mode
    const speed = mode === 'words' ? 0.35 : 0.45;

    const newBalloon = {
      id: nextIdRef.current++,
      text: text.toLowerCase(),
      typedIndex: 0,
      x,
      y: 95, // Starts near bottom of sky
      speed,
      colorScheme,
      drift: (Math.random() - 0.5) * 0.4 // gentle wobble
    };

    setBalloons(prev => [...prev, newBalloon]);
  }, [mode]);

  // Restart / Reset game
  const handleRestart = (newMode = mode) => {
    setMode(newMode);
    setScore(0);
    setCombo(0);
    setLives(3);
    setTotalAttempts(0);
    setSuccessfulHits(0);
    setBalloons([]);
    setParticles([]);
    setPopTexts([]);
    setIsPlaying(true);
    setIsPaused(false);
    lastSpawnTimeRef.current = Date.now();
    if (containerRef.current) containerRef.current.focus();
  };

  // Main game loop (animation & balloon rising)
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    let isMounted = true;

    const gameLoop = () => {
      const now = Date.now();
      // Spawn balloon interval: every 1.8 to 2.4 seconds
      const spawnInterval = mode === 'words' ? 2400 : 1800;
      if (now - lastSpawnTimeRef.current > spawnInterval) {
        lastSpawnTimeRef.current = now;
        spawnBalloon();
      }

      setBalloons(prev => {
        const next = [];
        let lostLife = false;

        for (const b of prev) {
          const newY = b.y - b.speed;
          // If balloon reaches the top ceiling without popping
          if (newY <= 5) {
            lostLife = true;
          } else {
            // Apply slight horizontal drift
            const newX = Math.max(8, Math.min(88, b.x + b.drift));
            next.push({ ...b, y: newY, x: newX });
          }
        }

        if (lostLife) {
          sounds.playError();
          setLives(l => {
            const updated = l - 1;
            if (updated <= 0) {
              // Game over!
              setIsPlaying(false);
            }
            return updated;
          });
          setCombo(0);
        }

        return next;
      });

      if (isMounted && isPlaying && !isPaused) {
        animFrameRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isPaused, mode, spawnBalloon]);

  // Create explosion particles on balloon pop
  const triggerPopEffects = (x, y, colorScheme) => {
    sounds.playPop();

    // Floating score popup
    const popupId = Date.now() + Math.random();
    setPopTexts(prev => [
      ...prev,
      { id: popupId, x, y, text: `+${10 + combo * 2}` }
    ]);
    setTimeout(() => {
      setPopTexts(prev => prev.filter(p => p.id !== popupId));
    }, 800);

    // 8 sparkle particles
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = Math.random() * 40 + 20;
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colorScheme.bg
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 600);
  };

  // Keyboard handler
  const handleKeyDown = (e) => {
    if (!isPlaying || isPaused) return;

    // Ignore modifier keys
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

    const pressedKey = e.key.toLowerCase();
    setLastPressedKey(pressedKey);
    setTotalAttempts(a => a + 1);

    // Look for matching balloon:
    // If a balloon is partially typed, player must continue typing that balloon.
    // Otherwise, match the balloon closest to the top that starts with pressedKey.
    let matchedBalloonIndex = balloons.findIndex(b => b.typedIndex > 0);

    if (matchedBalloonIndex === -1) {
      // Find candidate balloons that start with pressedKey, prefer highest balloon (lowest y)
      const candidates = balloons
        .map((b, idx) => ({ ...b, originalIndex: idx }))
        .filter(b => b.text[0] === pressedKey)
        .sort((a, b) => a.y - b.y);

      if (candidates.length > 0) {
        matchedBalloonIndex = candidates[0].originalIndex;
      }
    }

    if (matchedBalloonIndex !== -1) {
      const targetBalloon = balloons[matchedBalloonIndex];
      const expectedChar = targetBalloon.text[targetBalloon.typedIndex];

      if (pressedKey === expectedChar) {
        setIsKeyError(false);
        const nextTypedIndex = targetBalloon.typedIndex + 1;

        if (nextTypedIndex >= targetBalloon.text.length) {
          // Balloon completely popped!
          triggerPopEffects(targetBalloon.x, targetBalloon.y, targetBalloon.colorScheme);
          setBalloons(prev => prev.filter((_, idx) => idx !== matchedBalloonIndex));
          setScore(s => s + 10 + combo * 2);
          setCombo(c => c + 1);
          setSuccessfulHits(h => h + 1);
        } else {
          // Progress on word balloon
          sounds.playSuccess();
          setBalloons(prev => prev.map((b, idx) => 
            idx === matchedBalloonIndex ? { ...b, typedIndex: nextTypedIndex } : b
          ));
          setSuccessfulHits(h => h + 1);
        }
      } else {
        // Wrong key while targeting balloon
        sounds.playError();
        setIsKeyError(true);
        setCombo(0);
      }
    } else {
      // No balloon matches this key
      sounds.playError();
      setIsKeyError(true);
      setCombo(0);
    }
  };

  // Handle Game Over / Round Victory
  useEffect(() => {
    if (lives <= 0 && isPlaying) {
      setIsPlaying(false);
    }
  }, [lives, isPlaying]);

  const handleFinishRound = () => {
    const accuracy = totalAttempts > 0 ? Math.round((successfulHits / totalAttempts) * 100) : 100;
    // Calculate stars: 3 stars if score >= 100, 2 stars if score >= 50, else 1 star
    let starsEarned = 1;
    if (score >= 120) starsEarned = 3;
    else if (score >= 50) starsEarned = 2;

    onComplete({
      gameId: 'balloonPop',
      score,
      starsEarned,
      wordsTyped: successfulHits,
      keysPressed: totalAttempts,
      accuracy,
      wpm: Math.round(successfulHits * 4) // simple kid pacing proxy
    });
  };

  // Auto trigger completion when lives run out
  useEffect(() => {
    if (!isPlaying && lives <= 0) {
      handleFinishRound();
    }
  }, [isPlaying, lives]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none flex flex-col items-center w-full max-w-5xl mx-auto px-2 select-none"
    >
      {/* Top Controls & Status Bar */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl border-4 border-sky-200 shadow-md p-3 sm:p-4 mb-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Game Title & Difficulty selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-500 text-white flex items-center justify-center text-2xl shadow-sm">
            🎈
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
              Balloon Pop!
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              {['home_row', 'alphabet', 'words'].map((m) => (
                <button
                  key={m}
                  onClick={() => { sounds.playClick(); handleRestart(m); }}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize transition-all cursor-pointer ${
                    mode === m
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Score & Combo */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Score</span>
            <span className="text-2xl font-black text-amber-500">{score}</span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1 bg-orange-100 border border-orange-300 text-orange-800 px-2.5 py-1 rounded-xl text-xs font-black animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>{combo}x Combo!</span>
            </div>
          )}
        </div>

        {/* Lives (Hearts) & Game Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                className={`w-6 h-6 transition-transform ${
                  heartIndex <= lives
                    ? 'text-rose-500 fill-rose-500 scale-100 animate-pulse'
                    : 'text-slate-200 fill-slate-200 scale-90'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setIsPaused(p => !p);
            }}
            className="btn-fun bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              handleRestart();
            }}
            className="btn-fun bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onBackToMenu();
            }}
            className="btn-fun bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl"
            title="Back to Dashboard"
          >
            <Home className="w-4 h-4 text-slate-600" />
          </button>
        </div>

      </div>

      {/* Balloon Sky Playground */}
      <div className="relative w-full h-[400px] sm:h-[460px] rounded-3xl bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100/60 border-4 border-white shadow-xl overflow-hidden mb-4">
        
        {/* Sky Clouds and Background Details */}
        <div className="absolute top-4 left-8 text-5xl opacity-40 select-none pointer-events-none animate-float-slow">
          ☁️
        </div>
        <div className="absolute top-12 right-12 text-6xl opacity-35 select-none pointer-events-none animate-float-slow" style={{ animationDelay: '2s' }}>
          ☁️
        </div>
        <div className="absolute top-2 left-1/2 text-4xl opacity-25 select-none pointer-events-none">
          ☁️
        </div>

        {/* Danger ceiling warning line */}
        <div className="absolute top-2 left-0 right-0 h-1 bg-rose-400/30 border-b border-dashed border-rose-400/60 flex items-center justify-center">
          <span className="text-[10px] font-bold text-rose-500 bg-white/80 px-2 rounded-full uppercase tracking-widest">
            Don't let balloons escape!
          </span>
        </div>

        {/* Paused Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white">
            <span className="text-5xl mb-2">⏸️</span>
            <h3 className="text-3xl font-black">Game Paused</h3>
            <p className="text-sm font-quicksand font-bold mb-4">Take a breather, Little Typist!</p>
            <button
              onClick={() => { sounds.playClick(); setIsPaused(false); }}
              className="btn-fun-primary px-6 py-2.5 text-base"
            >
              Resume Game
            </button>
          </div>
        )}

        {/* Rising Balloons */}
        {balloons.map((b) => {
          const isTargeted = b.typedIndex > 0;
          const typedPart = b.text.slice(0, b.typedIndex);
          const remainingPart = b.text.slice(b.typedIndex);

          return (
            <div
              key={b.id}
              className="absolute transform -translate-x-1/2 transition-transform duration-75"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
              }}
            >
              {/* Balloon Body */}
              <div
                className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-full bg-gradient-to-t ${b.colorScheme.bg} border-2 ${b.colorScheme.border} flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-105 transition-transform ${
                  isTargeted ? 'ring-4 ring-amber-300 scale-110' : ''
                }`}
              >
                {/* Balloon shine highlight */}
                <div className="absolute top-2 left-3 w-4 h-6 bg-white/40 rounded-full rotate-[-30deg]" />

                {/* Letter or Word inside balloon */}
                <div className="font-black text-2xl sm:text-3xl tracking-wide select-none drop-shadow-md">
                  <span className="text-amber-200 underline">{typedPart}</span>
                  <span className={b.colorScheme.text}>{remainingPart}</span>
                </div>

                {/* Balloon knot */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-2 bg-inherit rounded-b-sm border-t border-black/10" />
                {/* Balloon string */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-white/70" />
              </div>
            </div>
          );
        })}

        {/* Floating pop score texts */}
        {popTexts.map((pt) => (
          <div
            key={pt.id}
            className="absolute font-black text-xl text-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] animate-bounce pointer-events-none z-20"
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
          >
            {pt.text} ⭐
          </div>
        ))}

        {/* Sparkle burst particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute w-3 h-3 rounded-full bg-gradient-to-tr ${p.color} pointer-events-none transition-all duration-500 transform`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: `translate(${p.vx}px, ${p.vy}px) scale(0)`,
              opacity: 0
            }}
          />
        ))}

        {/* Prompt to click and type if unfocused */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-white">
          🎯 Next key to press: <span className="text-amber-600 font-black text-sm uppercase">{activeTargetKey || 'Watch the sky!'}</span>
        </div>

      </div>

      {/* On-screen Virtual Keyboard showing finger guide */}
      <VirtualKeyboard
        activeKey={activeTargetKey}
        lastPressedKey={lastPressedKey}
        isError={isKeyError}
        showFingerHints={true}
      />

    </div>
  );
}
