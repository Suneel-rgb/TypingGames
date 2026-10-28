import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RotateCcw, Home, Sparkles, Flame, Zap } from 'lucide-react';
import { FRUIT_WORDS, HOME_ROW_KEYS, getRandomItem } from '../utils/words';
import { sounds } from '../utils/soundEffects';
import VirtualKeyboard from '../components/VirtualKeyboard';

const FRUITS_DATA = [
  { emoji: '🍉', name: 'watermelon', color: 'from-rose-400 to-emerald-500', splash: 'bg-rose-400' },
  { emoji: '🍓', name: 'strawberry', color: 'from-red-400 to-rose-600', splash: 'bg-red-400' },
  { emoji: '🍍', name: 'pineapple', color: 'from-amber-400 to-yellow-600', splash: 'bg-amber-300' },
  { emoji: '🍌', name: 'banana', color: 'from-yellow-300 to-amber-400', splash: 'bg-yellow-300' },
  { emoji: '🍊', name: 'orange', color: 'from-orange-400 to-amber-500', splash: 'bg-orange-400' },
  { emoji: '🍇', name: 'grapes', color: 'from-purple-400 to-indigo-600', splash: 'bg-purple-400' },
  { emoji: '🥝', name: 'kiwi', color: 'from-lime-400 to-emerald-600', splash: 'bg-lime-400' },
  { emoji: '🍎', name: 'apple', color: 'from-red-500 to-rose-500', splash: 'bg-red-400' },
];

export default function FruitSlicer({ onComplete, onBackToMenu }) {
  // Mode: 'letters' (home row) | 'words' (fruit vocabulary)
  const [mode, setMode] = useState('words');
  const [isPlaying, setIsPlaying] = useState(true);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [successfulHits, setSuccessfulHits] = useState(0);
  
  // Active and Sliced Fruits
  const [fruits, setFruits] = useState([]);
  const [slicedHalves, setSlicedHalves] = useState([]);
  const [splashes, setSplashes] = useState([]);
  const [slicePopups, setSlicePopups] = useState([]);

  // Virtual keyboard state
  const [lastPressedKey, setLastPressedKey] = useState('');
  const [isKeyError, setIsKeyError] = useState(false);

  const containerRef = useRef(null);
  const nextIdRef = useRef(1);
  const animFrameRef = useRef(null);
  const lastSpawnRef = useRef(Date.now());

  // Determine active targeted fruit (closest to bottom or partially typed)
  const targetedFruit = fruits.find(f => f.typedIndex > 0) || fruits.slice().sort((a, b) => b.y - a.y)[0];
  const activeTargetKey = targetedFruit ? targetedFruit.text[targetedFruit.typedIndex || 0] : '';

  // Spawn a fruit
  const spawnFruit = useCallback(() => {
    let text = '';
    if (mode === 'letters') {
      text = getRandomItem(HOME_ROW_KEYS);
    } else {
      text = getRandomItem(FRUIT_WORDS);
    }

    const fruitType = getRandomItem(FRUITS_DATA);
    const x = Math.floor(Math.random() * 70) + 15; // 15% to 85%
    const speed = mode === 'letters' ? 0.42 : 0.32;

    const newFruit = {
      id: nextIdRef.current++,
      text: text.toLowerCase(),
      typedIndex: 0,
      fruitType,
      x,
      y: 5, // Falls from top canopy
      speed,
      rotation: Math.random() * 30 - 15
    };

    setFruits(prev => [...prev, newFruit]);
  }, [mode]);

  // Restart
  const handleRestart = (newMode = mode) => {
    setMode(newMode);
    setScore(0);
    setCombo(0);
    setLives(3);
    setTotalAttempts(0);
    setSuccessfulHits(0);
    setFruits([]);
    setSlicedHalves([]);
    setSplashes([]);
    setSlicePopups([]);
    setIsPlaying(true);
    lastSpawnRef.current = Date.now();
    if (containerRef.current) containerRef.current.focus();
  };

  // Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    let isMounted = true;

    const gameLoop = () => {
      const now = Date.now();
      const spawnInterval = mode === 'words' ? 2400 : 1800;

      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;
        spawnFruit();
      }

      setFruits(prev => {
        const next = [];
        let dropped = false;

        for (const f of prev) {
          const newY = f.y + f.speed;
          if (newY >= 84) {
            dropped = true;
          } else {
            next.push({ ...f, y: newY });
          }
        }

        if (dropped) {
          sounds.playError();
          setLives(l => {
            const updated = l - 1;
            if (updated <= 0) setIsPlaying(false);
            return updated;
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
  }, [isPlaying, mode, spawnFruit]);

  // Trigger Juicy Slice Animation
  const sliceFruit = (fruit) => {
    sounds.playSlice();
    sounds.playSplash();

    // 1. Create Splat Splash
    const splashId = Date.now() + Math.random();
    setSplashes(prev => [...prev, { id: splashId, x: fruit.x, y: fruit.y, color: fruit.fruitType.splash }]);
    setTimeout(() => {
      setSplashes(prev => prev.filter(s => s.id !== splashId));
    }, 700);

    // 2. Create Floating +Slice score popup
    const popupId = Date.now() + Math.random();
    setSlicePopups(prev => [
      ...prev,
      { id: popupId, x: fruit.x, y: fruit.y, text: `+${15 + combo * 3} SLICE!` }
    ]);
    setTimeout(() => {
      setSlicePopups(prev => prev.filter(p => p.id !== popupId));
    }, 800);

    // 3. Create two separated halves that spin and fly apart
    const halfLeftId = Date.now() + 1;
    const halfRightId = Date.now() + 2;
    setSlicedHalves(prev => [
      ...prev,
      { id: halfLeftId, emoji: fruit.fruitType.emoji, x: fruit.x - 4, y: fruit.y, dir: -1 },
      { id: halfRightId, emoji: fruit.fruitType.emoji, x: fruit.x + 4, y: fruit.y, dir: 1 }
    ]);
    setTimeout(() => {
      setSlicedHalves(prev => prev.filter(h => h.id !== halfLeftId && h.id !== halfRightId));
    }, 600);

    // 4. Update Game State
    setFruits(prev => prev.filter(f => f.id !== fruit.id));
    setScore(s => s + 15 + combo * 3);
    setCombo(c => c + 1);
    setSuccessfulHits(h => h + 1);
  };

  // Keyboard Handler
  const handleKeyDown = (e) => {
    if (!isPlaying) return;
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

    const key = e.key.toLowerCase();
    setLastPressedKey(key);
    setTotalAttempts(t => t + 1);

    // Match fruit: check if any fruit is partially typed first
    let matchIdx = fruits.findIndex(f => f.typedIndex > 0);

    if (matchIdx === -1) {
      // Find candidate starting with key, prefer lowest y (closest to landing)
      const candidates = fruits
        .map((f, i) => ({ ...f, originalIdx: i }))
        .filter(f => f.text[0] === key)
        .sort((a, b) => b.y - a.y);

      if (candidates.length > 0) {
        matchIdx = candidates[0].originalIdx;
      }
    }

    if (matchIdx !== -1) {
      const target = fruits[matchIdx];
      const expectedChar = target.text[target.typedIndex];

      if (key === expectedChar) {
        setIsKeyError(false);
        const nextTyped = target.typedIndex + 1;

        if (nextTyped >= target.text.length) {
          sliceFruit(target);
        } else {
          sounds.playSuccess();
          setFruits(prev => prev.map((f, i) => 
            i === matchIdx ? { ...f, typedIndex: nextTyped } : f
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

  // Finish Round
  useEffect(() => {
    if (lives <= 0 && isPlaying) {
      setIsPlaying(false);
      const acc = totalAttempts > 0 ? Math.round((successfulHits / totalAttempts) * 100) : 100;
      setTimeout(() => {
        onComplete({
          gameId: 'fruitSlicer',
          score,
          starsEarned: score >= 120 ? 3 : score >= 60 ? 2 : 1,
          wordsTyped: successfulHits,
          keysPressed: totalAttempts,
          accuracy: acc,
          wpm: Math.round(successfulHits * 4.5)
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
      {/* Top Controls & Status Bar with Framer Motion spring */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="w-full bg-white/95 backdrop-blur-md rounded-3xl border-4 border-emerald-300 shadow-md p-3 sm:p-4 mb-3 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-green-600 text-white flex items-center justify-center text-2xl shadow-sm"
          >
            🍉
          </motion.div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
              Fruit Slicer
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              {['words', 'letters'].map(m => (
                <button
                  key={m}
                  onClick={() => { sounds.playClick(); handleRestart(m); }}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize transition-all cursor-pointer ${
                    mode === m
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m === 'words' ? 'Fruit Words' : 'Home Row'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Score & Combo */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Juice Score</span>
            <span className="text-2xl font-black text-emerald-600">{score}</span>
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
                <span>{combo}x Slice Combo!</span>
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
            <Home className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </motion.div>

      {/* Tropical Fruit Canopy Arena with Framer Motion spring entrance */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full h-[400px] sm:h-[450px] rounded-3xl bg-gradient-to-b from-emerald-100 via-amber-50 to-orange-100/70 border-4 border-white shadow-xl overflow-hidden mb-4"
      >
        {/* Jungle foliage in background */}
        <div className="absolute top-2 left-6 text-4xl opacity-35 select-none pointer-events-none">🌿</div>
        <div className="absolute top-4 right-10 text-5xl opacity-35 select-none pointer-events-none">🌴</div>
        <div className="absolute bottom-16 right-8 text-4xl opacity-30 select-none pointer-events-none">🥥</div>

        {/* Chopping Board / Danger Line */}
        <div className="absolute bottom-16 left-0 right-0 h-1 bg-amber-400/40 border-b border-dashed border-amber-500/60 flex items-center justify-center">
          <span className="text-[10px] font-bold text-amber-700 bg-white/90 px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Slice before fruits drop! 🔪
          </span>
        </div>

        {/* Falling Fruits */}
        {fruits.map(fruit => {
          const isTargeted = targetedFruit && targetedFruit.id === fruit.id;
          const typedPart = fruit.text.slice(0, fruit.typedIndex);
          const remainingPart = fruit.text.slice(fruit.typedIndex);

          return (
            <motion.div
              key={fruit.id}
              className="absolute transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
              style={{ left: `${fruit.x}%`, top: `${fruit.y}%` }}
              animate={{ rotate: isTargeted ? [0, -6, 6, 0] : fruit.rotation }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {/* Juicy Fruit Card */}
              <div
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr ${fruit.fruitType.color} flex items-center justify-center text-4xl shadow-lg border-2 border-white/80 transition-all ${
                  isTargeted ? 'ring-4 ring-amber-300 scale-110 shadow-amber-300/50' : ''
                }`}
              >
                <span>{fruit.fruitType.emoji}</span>
              </div>

              {/* Word Tag */}
              <div className="mt-1 bg-white/95 border-2 border-emerald-300 px-3 py-0.5 rounded-xl shadow-md text-sm font-black font-mono tracking-wider whitespace-nowrap">
                <span className="text-emerald-500 underline">{typedPart}</span>
                <span className="text-slate-800">{remainingPart}</span>
              </div>
            </motion.div>
          );
        })}

        {/* Splat splashes on slice */}
        <AnimatePresence>
          {splashes.map(sp => (
            <motion.div
              key={sp.id}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className={`absolute w-12 h-12 rounded-full ${sp.color} blur-md pointer-events-none -translate-x-1/2 -translate-y-1/2`}
              style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
            />
          ))}
        </AnimatePresence>

        {/* Sliced Flying Halves */}
        <AnimatePresence>
          {slicedHalves.map(half => (
            <motion.div
              key={half.id}
              initial={{ scale: 1, x: 0, y: 0, rotate: 0 }}
              animate={{
                x: half.dir * 45,
                y: 60,
                rotate: half.dir * 180,
                opacity: 0,
                scale: 0.6
              }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="absolute text-3xl pointer-events-none -translate-x-1/2"
              style={{ left: `${half.x}%`, top: `${half.y}%` }}
            >
              {half.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Floating +Slice score text popups */}
        <AnimatePresence>
          {slicePopups.map(pt => (
            <motion.div
              key={pt.id}
              initial={{ scale: 0.5, y: 0, opacity: 1 }}
              animate={{ scale: 1.2, y: -30, opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute font-black text-xl text-emerald-600 drop-shadow-md pointer-events-none z-30"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            >
              {pt.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Bottom hint prompt */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/85 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-emerald-200">
          🍉 Next slice key: <strong className="text-emerald-600 uppercase text-sm">{activeTargetKey || 'Watch the fruits!'}</strong>
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
