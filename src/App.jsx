import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GameCard from './components/GameCard';
import RewardCabinet from './components/RewardCabinet';
import AvatarPickerModal from './components/AvatarPickerModal';
import CelebrationModal from './components/CelebrationModal';
import BalloonPop from './games/BalloonPop';
import SpeedyRacer from './games/SpeedyRacer';
import SpaceBlaster from './games/SpaceBlaster';
import { getStoredUserData, saveUserData, recordGameResult, AVATARS_LIST } from './utils/storage';
import { sounds } from './utils/soundEffects';
import { Sparkles, Trophy, Zap, Keyboard, Award, HeartHandshake, Star } from 'lucide-react';

export default function App() {
  const [userData, setUserData] = useState(() => getStoredUserData());
  const [currentGame, setCurrentGame] = useState(null); // null | 'balloonPop' | 'speedyRacer' | 'spaceBlaster'
  const [isCabinetOpen, setIsCabinetOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  
  // Celebration modal state
  const [celebrationState, setCelebrationState] = useState({
    isOpen: false,
    title: '',
    score: 0,
    starsEarned: 3,
    wpm: 0,
    accuracy: 100,
    wordsTyped: 0,
    newBadges: []
  });

  // Sync sound settings with audio manager
  useEffect(() => {
    sounds.setEnabled(userData.soundEnabled);
  }, [userData.soundEnabled]);

  // Handle sound toggle
  const handleToggleSound = () => {
    const updated = { ...userData, soundEnabled: !userData.soundEnabled };
    setUserData(updated);
    saveUserData(updated);
    sounds.setEnabled(updated.soundEnabled);
  };

  // Handle avatar select
  const handleSelectAvatar = (avatarId) => {
    const updated = { ...userData, selectedAvatar: avatarId };
    setUserData(updated);
    saveUserData(updated);
  };

  // Launch a game
  const handleStartGame = (gameId) => {
    sounds.playClick();
    setCurrentGame(gameId);
  };

  // Complete game round
  const handleGameComplete = ({ gameId, score, starsEarned, wordsTyped, keysPressed, accuracy, wpm }) => {
    const { updatedData, newlyEarnedBadges } = recordGameResult({
      gameId,
      score,
      starsEarned,
      wordsTyped,
      keysPressed,
      wpm
    });

    setUserData({ ...updatedData });

    setCelebrationState({
      isOpen: true,
      title: gameId === 'balloonPop' ? 'Popping Master!' : gameId === 'speedyRacer' ? 'Race Finished!' : 'Galaxy Protected!',
      score,
      starsEarned,
      wpm,
      accuracy,
      wordsTyped,
      newBadges: newlyEarnedBadges
    });
  };

  // Current avatar mascot
  const currentAvatar = AVATARS_LIST.find(a => a.id === userData.selectedAvatar) || AVATARS_LIST[0];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-sky-50 via-amber-50/50 to-pink-50/40 text-slate-800">
      
      {/* Top Navbar */}
      <Navbar
        userData={userData}
        currentGame={currentGame}
        onNavigateHome={() => setCurrentGame(null)}
        onOpenCabinet={() => setIsCabinetOpen(true)}
        onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Render Active Game */}
        {currentGame === 'balloonPop' && (
          <BalloonPop
            onComplete={handleGameComplete}
            onBackToMenu={() => setCurrentGame(null)}
          />
        )}

        {currentGame === 'speedyRacer' && (
          <SpeedyRacer
            onComplete={handleGameComplete}
            onBackToMenu={() => setCurrentGame(null)}
          />
        )}

        {currentGame === 'spaceBlaster' && (
          <SpaceBlaster
            onComplete={handleGameComplete}
            onBackToMenu={() => setCurrentGame(null)}
          />
        )}

        {/* Dashboard Landing View */}
        {!currentGame && (
          <div className="flex flex-col gap-8">
            
            {/* Playful Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 p-6 sm:p-10 text-white shadow-xl border-4 border-white">
              
              {/* Background decorative bubbles */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-10 w-60 h-60 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black mb-3">
                    <Sparkles className="w-4 h-4 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Welcome back, Little Typist!</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-sm">
                    Ready to Play &amp; Learn?
                  </h1>
                  <p className="mt-2 text-white/95 text-base sm:text-lg font-quicksand font-semibold max-w-xl">
                    Pop colorful balloons, race cute cars, and blast alien ships while mastering your keyboard!
                  </p>
                </div>

                {/* Mascot Card */}
                <div 
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl text-slate-800 shadow-xl border-4 border-amber-200 flex items-center gap-4 cursor-pointer transform hover:scale-105 transition-all"
                  title="Click to switch your buddy!"
                >
                  <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center text-4xl shadow-sm">
                    {currentAvatar.emoji}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-pink-600 uppercase tracking-wider block">
                      Your Mascot Buddy
                    </span>
                    <strong className="text-xl font-black text-slate-800 block">
                      {currentAvatar.name}
                    </strong>
                    <span className="text-xs text-slate-500 font-semibold underline">
                      Click to change buddy
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80 block">Total Stars</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-200">{userData.stars} ⭐</span>
                </div>
                <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80 block">Games Played</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{userData.stats.gamesPlayed}</span>
                </div>
                <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80 block">Words Mastered</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{userData.stats.totalWordsTyped}</span>
                </div>
                <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80 block">Top Speed</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{userData.stats.bestWPM} <span className="text-xs">WPM</span></span>
                </div>
              </div>

            </div>

            {/* Games Selection Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                    Choose Your Adventure
                  </h2>
                  <p className="text-slate-500 font-quicksand font-bold text-sm">
                    3 interactive games designed to build touch typing superpowers!
                  </p>
                </div>
              </div>

              {/* 3 Game Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Balloon Pop */}
                <GameCard
                  id="balloonPop"
                  title="Balloon Pop"
                  subtitle="Letter Recognition &amp; Home Row"
                  tagline="Float through sunny skies! Pop rising balloons by pressing the matching key before they float away."
                  difficulty="Beginner"
                  difficultyColor="bg-emerald-500 text-white"
                  icon="🎈"
                  gradient="from-pink-400 via-rose-400 to-amber-400"
                  shadowColor="#db2777"
                  focusSkill="Home Row (A S D F J K L)"
                  highScore={userData.highScores.balloonPop || 0}
                  onPlay={handleStartGame}
                />

                {/* 2. Speedy Racer */}
                <GameCard
                  id="speedyRacer"
                  title="Speedy Racer"
                  subtitle="Word Typing &amp; WPM Speed"
                  tagline="Rev your cute racecar engine! Type sequential words to trigger turbo boosts and beat the rival AI racer."
                  difficulty="Intermediate"
                  difficultyColor="bg-sky-500 text-white"
                  icon="🏎️"
                  gradient="from-blue-500 via-sky-400 to-indigo-500"
                  shadowColor="#2563eb"
                  focusSkill="Speed &amp; Word Flow (WPM)"
                  highScore={userData.highScores.speedyRacer || 0}
                  onPlay={handleStartGame}
                />

                {/* 3. Space Blaster */}
                <GameCard
                  id="spaceBlaster"
                  title="Space Blaster"
                  subtitle="Sentence &amp; Vocabulary"
                  tagline="Guard the galaxy from descending alien UFOs! Lock your laser cannons and destroy ships with typing power."
                  difficulty="Advanced"
                  difficultyColor="bg-purple-500 text-white"
                  icon="🚀"
                  gradient="from-purple-500 via-violet-600 to-pink-500"
                  shadowColor="#7c3aed"
                  focusSkill="Full Sentences &amp; Vocabulary"
                  highScore={userData.highScores.spaceBlaster || 0}
                  onPlay={handleStartGame}
                />

              </div>
            </div>

            {/* Kid Typing Guide & Interactive Feature Highlights */}
            <div className="card-kid p-6 sm:p-8 bg-white/90 border-4 border-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl shadow-sm">
                  💡
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                    How Touch Typing Works for Kids
                  </h3>
                  <p className="text-slate-500 font-quicksand font-bold text-xs sm:text-sm">
                    Easy secrets that make you type fast without even looking down!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <div className="text-2xl mb-1">🏠</div>
                  <h4 className="font-black text-slate-800 text-base mb-1">1. The Home Row</h4>
                  <p className="text-xs text-slate-600 font-quicksand font-semibold leading-relaxed">
                    Always rest your fingers on <strong className="text-amber-800">A, S, D, F</strong> and <strong className="text-amber-800">J, K, L</strong>. Notice the small bumps on F and J!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200">
                  <div className="text-2xl mb-1">👀</div>
                  <h4 className="font-black text-slate-800 text-base mb-1">2. Look at the Screen</h4>
                  <p className="text-xs text-slate-600 font-quicksand font-semibold leading-relaxed">
                    Follow the on-screen colorful keyboard guides. Trust your fingers and muscle memory!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200">
                  <div className="text-2xl mb-1">⭐</div>
                  <h4 className="font-black text-slate-800 text-base mb-1">3. Daily Streaks</h4>
                  <p className="text-xs text-slate-600 font-quicksand font-semibold leading-relaxed">
                    Playing just 5 to 10 minutes a day builds blazing speed, unlocks new badges, and earns shiny stars!
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Reward / Badge Cabinet Modal */}
      <RewardCabinet
        isOpen={isCabinetOpen}
        onClose={() => setIsCabinetOpen(false)}
        userData={userData}
      />

      {/* Mascot Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        selectedAvatarId={userData.selectedAvatar}
        onSelectAvatar={handleSelectAvatar}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={celebrationState.isOpen}
        title={celebrationState.title}
        score={celebrationState.score}
        starsEarned={celebrationState.starsEarned}
        wpm={celebrationState.wpm}
        accuracy={celebrationState.accuracy}
        wordsTyped={celebrationState.wordsTyped}
        newBadges={celebrationState.newBadges}
        onPlayAgain={() => {
          setCelebrationState(prev => ({ ...prev, isOpen: false }));
        }}
        onBackToMenu={() => {
          setCelebrationState(prev => ({ ...prev, isOpen: false }));
          setCurrentGame(null);
        }}
      />

    </div>
  );
}
