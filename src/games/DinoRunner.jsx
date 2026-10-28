import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RotateCcw, Home, Sparkles, Flame } from 'lucide-react';
import { DINO_WORDS, HOME_ROW_KEYS, getRandomItem } from '../utils/words';
import { sounds } from '../utils/soundEffects';
import VirtualKeyboard from '../components/VirtualKeyboard';

const OBSTACLE_TYPES = [
  { icon: '🪨', name: 'Boulder' },
  { icon: '🌵', name: 'Cactus' },
  { icon: '🪵', name: 'Log' },
  { icon: '🌋', name: 'Mini Volcano' },
];

export default function DinoRunner({ onComplete, onBackToMenu }) {
  // Mode: 'easy' (home row/short) | 'adventure' (dino words)
  const [mode, setMode] = useState('adventure');
  const [isPlaying, setIsPlaying] = useState(true);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [successfulHits, setSuccessfulHits] = useState(0);

  // Dino state
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [collectedEggs, setCollectedEggs] = useState([]);

  // Virtual keyboard state
  const [lastPressedKey, setLastPressedKey] = useState('');
  const [isKeyError, setIsKeyError] = useState(false);

  const containerRef = useRef(null);
  const nextIdRef = useRef(1);
  const animFrameRef = useRef(null);
  const lastSpawnRef = useRef(Date.now());

  // Current active obstacle (closest to the Dino on the left)
  const activeObstacle = obstacles.find(o => o.typedIndex > 0) || obstacles.slice().sort((a, b) => a.x - b.x)[0];
  const activeTargetKey = activeObstacle ? activeObstacle.text[activeObstacle.typedIndex || 0] : '';

  // Spawn an obstacle from the right edge
  const spawnObstacle = useCallback(() => {
    let text = '';
    if (mode === 'easy') {
      text = getRandomItem(HOME_ROW_KEYS);
    } else {
      text = getRandomItem(DINO_WORDS);
    }

    const obsType = getRandomItem(OBSTACLE_TYPES);
    const speed = mode === 'easy' ? 0.38 : 0.30;

    const newObstacle = {
      id: nextIdRef.current++,
      text: text.toLowerCase(),
      typedIndex: 0,
      icon: obsType.icon,
      x: 95, // Starts far right
      speed,
      cleared: false
    };

    setObstacles(prev => [...prev, newObstacle]);
  }, [mode]);

  // Restart
  const handleRestart = (newMode = mode) => {
    setMode(newMode);
    setScore(0);
    setCombo(0);
    setLives(3);
    setTotalAttempts(0);
    setSuccessfulHits(0);
    setIsJumping(false);
    setObstacles([]);
    setCollectedEggs([]);
    setIsPlaying(true);
    lastSpawnRef.current = Date.now();
    if (containerRef.current) containerRef.current.focus();
  };

  // Main loop: Move obstacles leftwards toward Dino (at x: 15)
  useEffect(() => {
    if (!isPlaying) return;

    let isMounted = true;

    const gameLoop = () => {
      const now = Date.now();
      const spawnInterval = mode === 'adventure' ? 2800 : 2100;

      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;
        spawnObstacle();
      }

      setObstacles(prev => {
        const next = [];
        let tripped = false;

        for (const o of prev) {
          const newX = o.x - o.speed;
          // Dino is at x = 16%
          // If obstacle reaches Dino without being cleared:
          if (newX <= 16 && !o.cleared) {
            tripped = true;
          } else if (newX > -5) {
            next.push({ ...o, x: newX });
          }
        }

        if (tripped) {
          sounds.playError();
          setLives(l => {
            const nextLives = l - 1;
            if (nextLives <= 0) setIsPlaying(false);
            return nextLives;
          });
          setCombo(0);
        }

        return next;
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
  }, [isPlaying, mode, spawnObstacle]);

  // Dino Jump Over Obstacle
  const triggerDinoJump = (obstacle) => {
    sounds.playJump();
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600);

    // Spawn collected golden egg particle
    const eggId = Date.now();
    setCollectedEggs(prev => [...prev, { id: eggId, x: obstacle.x }]);
    setTimeout(() => {
      setCollectedEggs(prev => prev.filter(e => e.id !== eggId));
    }, 700);

    // Mark cleared
    setObstacles(prev => prev.filter(o => o.id !== obstacle.id));
    setScore(s => s + 20 + combo * 3);
    setCombo(c => c + 1);
    setSuccessfulHits(h => h + 1);
  };

  // Keyboard handler
  const handleKeyDown = (e) => {
    if (!isPlaying) return;
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

    const key = e.key.toLowerCase();
    setLastPressedKey(key);
    setTotalAttempts(t => t + 1);

    // Look for matching obstacle
    let targetIdx = obstacles.findIndex(o => o.typedIndex > 0);

    if (targetIdx === -1) {
      // Find candidate starting with key, prefer closest to Dino (lowest x)
      const candidates = obstacles
        .map((o, i) => ({ ...o, originalIdx: i }))
        .filter(o => o.text[0] === key)
        .sort((a, b) => a.x - b.x);

      if (candidates.length > 0) {
        targetIdx = candidates[0].originalIdx;
      }
    }

    if (targetIdx !== -1) {
      const target = obstacles[targetIdx];
      const expectedChar = target.text[target.typedIndex];

      if (key === expectedChar) {
        setIsKeyError(false);
        const nextTyped = target.typedIndex + 1;

        if (nextTyped >= target.text.length) {
          triggerDinoJump(target);
        } else {
          sounds.playSuccess();
          setObstacles(prev => prev.map((o, i) => 
            i === targetIdx ? { ...o, typedIndex: nextTyped } : o
          ));
          setSuccessfulHits(h => h + 1);
        }
      } else {
        sounds.playError();
        setIsKeyError(true);
        setCombo(0);
      }
    } else {
      sounds.playError();
      setIsKeyError(true);
      setCombo(0);
    }
  };

  // Complete game
  useEffect(() => {
    if (lives <= 0 && isPlaying) {
      setIsPlaying(false);
      const acc = totalAttempts > 0 ? Math.round((successfulHits / totalAttempts) * 100) : 100;
      setTimeout(() => {
        onComplete({
          gameId: 'dinoRunner',
          score,
          starsEarned: score >= 120 ? 3 : score >= 60 ? 2 : 1,
          wordsTyped: successfulHits,
          keysPressed: totalAttempts,
          accuracy: acc,
          wpm: Math.round(successfulHits * 4.2)
        });
      }, 1000);
    }
  }, [lives, isPlaying]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none flex flex-col items-center w-full max-w-5xl mx-auto px-2 select-none"
    >
      {/* Top Header Status Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="w-full bg-white/95 backdrop-blur-md rounded-3xl border-4 border-lime-300 shadow-md p-3 sm:p-4 mb-3 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.15, rotate: 10 }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-600 text-white flex items-center justify-center text-2xl shadow-sm"
          >
            🦖
          </motion.div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
              Dino Runner
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              {['adventure', 'easy'].map(m => (
                <button
                  key={m}
                  onClick={() => { sounds.playClick(); handleRestart(m); }}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize transition-all cursor-pointer ${
                    mode === m
                      ? 'bg-lime-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m === 'adventure' ? 'Jurassic Words' : 'Home Row'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Score & Combo */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Dino Score</span>
            <span className="text-2xl font-black text-lime-600">{score}</span>
          </div>

          <AnimatePresence>
            {combo > 1 && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="flex items-center gap-1 bg-amber-100 border-2 border-amber-300 text-amber-900 px-3 py-1 rounded-2xl text-xs font-black shadow-sm"
              >
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
                <span>{combo}x Jump Streak!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lives & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(heartIdx => (
              <Heart
                key={heartIdx}
                className={`w-6 h-6 transition-transform ${
                  heartIdx <= lives
                    ? 'text-rose-500 fill-rose-500 scale-100'
                    : 'text-slate-200 fill-slate-200 scale-90'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => { sounds.playClick(); handleRestart(); }}
            className="btn-fun bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { sounds.playClick(); onBackToMenu(); }}
            className="btn-fun bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl"
            title="Back to Dashboard"
          >
            <Home className="w-4 h-4 text-lime-600" />
          </button>
        </div>
      </motion.div>

      {/* Prehistoric Safari Track with Framer Motion spring */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full h-[360px] sm:h-[400px] rounded-3xl bg-gradient-to-b from-amber-100 via-lime-50 to-emerald-200 border-4 border-white shadow-xl overflow-hidden mb-4"
      >
        {/* Distant Prehistoric Scenery: Volcano, Pterodactyl, Clouds */}
        <div className="absolute top-4 right-16 text-5xl opacity-40 select-none pointer-events-none">🌋</div>
        <motion.div
          animate={{ x: [-20, 20, -20] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-6 left-1/3 text-4xl opacity-50 select-none pointer-events-none"
        >
          🦕
        </motion.div>
        <div className="absolute top-2 left-10 text-4xl opacity-30 select-none pointer-events-none">☁️</div>

        {/* Dino Character at x: 15% */}
        <motion.div
          className="absolute bottom-14 left-[15%] -translate-x-1/2 flex flex-col items-center z-20"
          animate={
            isJumping
              ? { y: [0, -90, -100, 0], rotate: [0, -18, 12, 0] }
              : { y: [0, -6, 0] }
          }
          transition={
            isJumping
              ? { duration: 0.55, ease: 'easeOut' }
              : { repeat: Infinity, duration: 0.5, ease: 'easeInOut' }
          }
        >
          {isJumping && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2, opacity: 0 }}
              className="text-xs font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full mb-1 shadow"
            >
              JUMP! ✨
            </motion.div>
          )}
          <div className="text-5xl sm:text-6xl filter drop-shadow-md">
            🦖
          </div>
        </motion.div>

        {/* Approaching Prehistoric Obstacles */}
        {obstacles.map(obs => {
          const isTargeted = activeObstacle && activeObstacle.id === obs.id;
          const typedPart = obs.text.slice(0, obs.typedIndex);
          const remainingPart = obs.text.slice(obs.typedIndex);

          return (
            <div
              key={obs.id}
              className="absolute bottom-14 transform -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${obs.x}%` }}
            >
              {/* Word Tag Floating Above Obstacle */}
              <motion.div
                animate={isTargeted ? { scale: [1, 1.08, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className={`mb-1 bg-white/95 border-2 px-3 py-0.5 rounded-xl shadow-md text-sm font-black font-mono tracking-wider whitespace-nowrap ${
                  isTargeted ? 'border-amber-400 ring-4 ring-amber-300' : 'border-lime-400'
                }`}
              >
                <span className="text-emerald-500 underline">{typedPart}</span>
                <span className="text-slate-800">{remainingPart}</span>
              </motion.div>

              {/* Obstacle Icon */}
              <div className="text-4xl filter drop-shadow-sm">
                {obs.icon}
              </div>
            </div>
          );
        })}

        {/* Golden Egg Particle Burst on Jump */}
        <AnimatePresence>
          {collectedEggs.map(egg => (
            <motion.div
              key={egg.id}
              initial={{ scale: 0.5, y: 0, opacity: 1 }}
              animate={{ scale: 1.5, y: -45, opacity: 0 }}
              transition={{ duration: 0.65 }}
              className="absolute bottom-28 left-[15%] text-3xl pointer-events-none z-30"
            >
              🥚 +20 ⭐
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Prehistoric Ground Track Strip */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 border-t-4 border-lime-600 flex items-center justify-around text-xs text-lime-300/60 font-mono select-none pointer-events-none">
          <span>🌿🌿🌿</span>
          <span>🦴🦴🦴</span>
          <span>🌿🌿🌿</span>
          <span>🐾🐾🐾</span>
          <span>🌿🌿🌿</span>
        </div>

        {/* Bottom hint prompt */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-0.5 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-lime-300 z-20">
          🦖 Jump key: <strong className="text-lime-600 uppercase text-sm">{activeTargetKey || 'Watch the obstacles!'}</strong>
        </div>
      </motion.div>

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        activeKey={activeTargetKey}
        lastPressedKey={lastPressedKey}
        isError={isKeyError}
        showFingerHints={true}
      />
    </div>
  );
}
