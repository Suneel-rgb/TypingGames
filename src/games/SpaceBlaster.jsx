import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Sparkles, Zap, RotateCcw, Home, Crosshair } from 'lucide-react';
import { SPACE_WORDS, SENTENCES, getRandomItem } from '../utils/words';
import { sounds } from '../utils/soundEffects';
import VirtualKeyboard from '../components/VirtualKeyboard';

const UFO_VARIANTS = [
  { icon: '🛸', color: 'from-purple-500 to-indigo-600', ring: 'ring-purple-400', glow: 'shadow-purple-500/50' },
  { icon: '👾', color: 'from-emerald-400 to-teal-600', ring: 'ring-emerald-400', glow: 'shadow-emerald-500/50' },
  { icon: '🚀', color: 'from-pink-500 to-rose-600', ring: 'ring-pink-400', glow: 'shadow-pink-500/50' },
  { icon: '☄️', color: 'from-amber-400 to-orange-600', ring: 'ring-amber-400', glow: 'shadow-amber-500/50' },
];

export default function SpaceBlaster({ onComplete, onBackToMenu }) {
  // Difficulty modes: 'words' | 'phrases'
  const [difficulty, setDifficulty] = useState('words');
  const [shield, setShield] = useState(100);
  const [score, setScore] = useState(0);
  const [aliensDestroyed, setAliensDestroyed] = useState(0);
  const [wave, setWave] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  // Targets & Laser state
  const [aliens, setAliens] = useState([]);
  const [activeLaser, setActiveLaser] = useState(null); // { startX, startY, endX, endY }
  const [explosions, setExplosions] = useState([]);

  // Keystrokes & stats
  const [totalKeys, setTotalKeys] = useState(0);
  const [correctKeys, setCorrectKeys] = useState(0);
  const [lastPressedKey, setLastPressedKey] = useState('');
  const [isKeyError, setIsKeyError] = useState(false);

  const containerRef = useRef(null);
  const nextIdRef = useRef(1);
  const animFrameRef = useRef(null);
  const lastSpawnTimeRef = useRef(Date.now());

  // Determine targeted alien:
  // If an alien is already partially typed (typedIndex > 0), player is locked onto it.
  // Otherwise, sort by lowest y (closest to landing).
  const targetedAlien = aliens.find(a => a.typedIndex > 0) || aliens.slice().sort((a, b) => b.y - a.y)[0];
  const activeTargetKey = targetedAlien ? targetedAlien.text[targetedAlien.typedIndex || 0] : '';

  // Spawn an alien invader
  const spawnAlien = useCallback(() => {
    let text = '';
    if (difficulty === 'words') {
      text = getRandomItem(SPACE_WORDS);
    } else {
      text = getRandomItem(SENTENCES);
    }

    const variant = getRandomItem(UFO_VARIANTS);
    const x = Math.floor(Math.random() * 70) + 15; // 15% to 85%
    const speed = difficulty === 'words' ? 0.28 : 0.22;

    const newAlien = {
      id: nextIdRef.current++,
      text: text.toLowerCase(),
      typedIndex: 0,
      x,
      y: 10, // Starts at top
      speed,
      variant
    };

    setAliens(prev => [...prev, newAlien]);
  }, [difficulty]);

  // Restart / Reset
  const handleRestart = (newDiff = difficulty) => {
    setDifficulty(newDiff);
    setShield(100);
    setScore(0);
    setAliensDestroyed(0);
    setWave(1);
    setAliens([]);
    setActiveLaser(null);
    setExplosions([]);
    setTotalKeys(0);
    setCorrectKeys(0);
    setIsPlaying(true);
    lastSpawnTimeRef.current = Date.now();
    if (containerRef.current) containerRef.current.focus();
  };

  // Main Game Loop: alien descent and laser updates
  useEffect(() => {
    if (!isPlaying) return;

    let isMounted = true;

    const gameLoop = () => {
      const now = Date.now();
      const spawnInterval = difficulty === 'words' ? 2800 : 4200;

      if (now - lastSpawnTimeRef.current > spawnInterval) {
        lastSpawnTimeRef.current = now;
        spawnAlien();
      }

      setAliens(prev => {
        const remaining = [];
        let hitBase = false;

        for (const a of prev) {
          const newY = a.y + a.speed;
          // Danger line near bottom
          if (newY >= 82) {
            hitBase = true;
          } else {
            remaining.push({ ...a, y: newY });
          }
        }

        if (hitBase) {
          sounds.playError();
          setShield(s => {
            const nextShield = Math.max(0, s - 25);
            if (nextShield <= 0) {
              setIsPlaying(false);
            }
            return nextShield;
          });
        }

        return remaining;
      });

      if (isMounted && isPlaying) {
        animFrameRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, difficulty, spawnAlien]);

  // Fire laser cannon and trigger explosion
  const fireLaserAndDestroy = (alien) => {
    sounds.playLaser();

    // Laser beam from bottom cannon (50%, 90%) to alien (alien.x%, alien.y%)
    setActiveLaser({
      startX: 50,
      startY: 92,
      endX: alien.x,
      endY: alien.y,
    });

    setTimeout(() => {
      sounds.playExplosion();
      setActiveLaser(null);

      // Add explosion animation
      const expId = Date.now() + Math.random();
      setExplosions(prev => [...prev, { id: expId, x: alien.x, y: alien.y }]);
      setTimeout(() => {
        setExplosions(prev => prev.filter(e => e.id !== expId));
      }, 700);
    }, 150);

    setAliens(prev => prev.filter(a => a.id !== alien.id));
    setScore(s => s + alien.text.length * 5);
    setAliensDestroyed(d => {
      const count = d + 1;
      if (count % 5 === 0) setWave(w => w + 1);
      return count;
    });
  };

  // Keyboard Event Listener
  const handleKeyDown = (e) => {
    if (!isPlaying) return;
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

    const key = e.key.toLowerCase();
    setLastPressedKey(key);
    setTotalKeys(t => t + 1);

    // Look for alien target
    let targetIndex = aliens.findIndex(a => a.typedIndex > 0);

    if (targetIndex === -1) {
      // Find candidate alien starting with pressed key, prefer lowest y
      const candidates = aliens
        .map((a, idx) => ({ ...a, originalIdx: idx }))
        .filter(a => a.text[0] === key)
        .sort((a, b) => b.y - a.y);

      if (candidates.length > 0) {
        targetIndex = candidates[0].originalIdx;
      }
    }

    if (targetIndex !== -1) {
      const targetAlien = aliens[targetIndex];
      const expectedChar = targetAlien.text[targetAlien.typedIndex];

      if (key === expectedChar) {
        setIsKeyError(false);
        setCorrectKeys(c => c + 1);

        const nextTyped = targetAlien.typedIndex + 1;

        if (nextTyped >= targetAlien.text.length) {
          // Blasted to stardust!
          fireLaserAndDestroy(targetAlien);
        } else {
          sounds.playSuccess();
          setAliens(prev => prev.map((a, idx) => 
            idx === targetIndex ? { ...a, typedIndex: nextTyped } : a
          ));
        }
      } else {
        sounds.playError();
        setIsKeyError(true);
      }
    } else {
      sounds.playError();
      setIsKeyError(true);
    }
  };

  // Game over or victory completion
  useEffect(() => {
    if (shield <= 0 && isPlaying) {
      setIsPlaying(false);
      const acc = totalKeys > 0 ? Math.round((correctKeys / totalKeys) * 100) : 100;
      setTimeout(() => {
        onComplete({
          gameId: 'spaceBlaster',
          score,
          starsEarned: score >= 150 ? 3 : score >= 60 ? 2 : 1,
          wordsTyped: aliensDestroyed,
          keysPressed: totalKeys,
          accuracy: acc,
          wpm: Math.round(aliensDestroyed * 5)
        });
      }, 1000);
    }
  }, [shield, isPlaying]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none flex flex-col items-center w-full max-w-5xl mx-auto px-2 select-none"
    >
      {/* Top Controls & Status Bar */}
      <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-3xl border-4 border-purple-500/50 shadow-xl p-3 sm:p-4 mb-3 flex flex-wrap items-center justify-between gap-3 text-white">
        
        {/* Title and Mode */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-2xl shadow-sm">
            🚀
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight text-purple-200">
              Space Blaster
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              {[
                { id: 'words', label: 'Space Words' },
                { id: 'phrases', label: 'Cosmic Phrases' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { sounds.playClick(); handleRestart(m.id); }}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    difficulty === m.id
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Score & Shield Health */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Cosmic Score</span>
            <span className="text-2xl font-black text-amber-400">{score}</span>
          </div>

          {/* Shield Progress */}
          <div className="flex items-center gap-2">
            <Shield className={`w-6 h-6 ${shield > 40 ? 'text-cyan-400' : 'text-rose-400 animate-pulse'}`} />
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-300">
                <span>Shield</span>
                <span>{shield}%</span>
              </div>
              <div className="w-24 sm:w-28 h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    shield > 50 ? 'bg-cyan-400' : shield > 25 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${shield}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Restart / Back */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { sounds.playClick(); handleRestart(); }}
            className="btn-fun bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl"
            title="Restart Mission"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { sounds.playClick(); onBackToMenu(); }}
            className="btn-fun bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl"
            title="Back to Dashboard"
          >
            <Home className="w-4 h-4 text-purple-300" />
          </button>
        </div>

      </div>

      {/* Cosmic Deep Space Arena */}
      <div className="relative w-full h-[420px] sm:h-[460px] rounded-3xl bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 border-4 border-purple-500/40 shadow-2xl overflow-hidden mb-4">
        
        {/* Twinkling star field */}
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        
        {/* Distant Nebula Glow */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-10 w-60 h-60 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Planetary Defense Line */}
        <div className="absolute bottom-16 left-0 right-0 h-0.5 bg-rose-500/50 border-b border-dashed border-rose-400/80 flex items-center justify-center">
          <span className="text-[10px] font-bold text-rose-400 bg-slate-900/90 px-3 py-0.5 rounded-full border border-rose-500/40 uppercase tracking-widest">
            Atmosphere Defense Line
          </span>
        </div>

        {/* Descending Alien Invaders */}
        {aliens.map((alien) => {
          const isTargeted = targetedAlien && targetedAlien.id === alien.id;
          const typedPart = alien.text.slice(0, alien.typedIndex);
          const remainingPart = alien.text.slice(alien.typedIndex);

          return (
            <div
              key={alien.id}
              className="absolute transform -translate-x-1/2 transition-transform duration-75 flex flex-col items-center"
              style={{
                left: `${alien.x}%`,
                top: `${alien.y}%`,
              }}
            >
              {/* Target Reticle if locked on */}
              {isTargeted && (
                <div className="absolute -top-5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }}>
                  <Crosshair className="w-5 h-5" />
                </div>
              )}

              {/* Alien UFO ship */}
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr ${alien.variant.color} flex items-center justify-center text-3xl shadow-lg border-2 border-white/40 ${
                  isTargeted ? 'ring-4 ring-amber-400 scale-110 shadow-amber-400/50' : ''
                }`}
              >
                <span>{alien.variant.icon}</span>
              </div>

              {/* Word/Sentence Tag */}
              <div className="mt-1 bg-slate-900/90 border border-purple-400/50 px-3 py-1 rounded-xl shadow-md text-sm font-black font-mono tracking-wider whitespace-nowrap">
                <span className="text-emerald-400 underline">{typedPart}</span>
                <span className="text-white">{remainingPart}</span>
              </div>
            </div>
          );
        })}

        {/* Laser Beam Canvas / SVG */}
        {activeLaser && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            <line
              x1={`${activeLaser.startX}%`}
              y1={`${activeLaser.startY}%`}
              x2={`${activeLaser.endX}%`}
              y2={`${activeLaser.endY}%`}
              stroke="#38bdf8"
              strokeWidth="6"
              strokeLinecap="round"
              className="animate-pulse"
            />
            <line
              x1={`${activeLaser.startX}%`}
              y1={`${activeLaser.startY}%`}
              x2={`${activeLaser.endX}%`}
              y2={`${activeLaser.endY}%`}
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Stardust Explosions */}
        {explosions.map((exp) => (
          <div
            key={exp.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 text-4xl animate-ping"
            style={{ left: `${exp.x}%`, top: `${exp.y}%` }}
          >
            💥
          </div>
        ))}

        {/* Player Star Cannon at the bottom center */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-t from-cyan-500 to-blue-600 flex items-center justify-center text-2xl border-2 border-cyan-300 shadow-cyan-500/50 shadow-lg">
            🚀
          </div>
          <div className="w-16 h-3 bg-slate-700 rounded-full mt-1 border border-cyan-400/40" />
        </div>

      </div>

      {/* On-screen Virtual Keyboard */}
      <VirtualKeyboard
        activeKey={activeTargetKey}
        lastPressedKey={lastPressedKey}
        isError={isKeyError}
        showFingerHints={true}
      />

    </div>
  );
}
