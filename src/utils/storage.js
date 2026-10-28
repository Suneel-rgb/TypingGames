// LocalStorage integration for Typist Kids: stars, streaks, high scores, badges, and stats

const STORAGE_KEY = 'typing_games_kid_data_v1';

export const BADGES_LIST = [
  {
    id: 'first_pop',
    title: 'Balloon Popper',
    desc: 'Pop your very first balloon!',
    icon: '🎈',
    category: 'balloonPop',
    color: 'from-pink-400 to-rose-500'
  },
  {
    id: 'home_row_hero',
    title: 'Home Row Hero',
    desc: 'Score 100+ points in Balloon Pop!',
    icon: '🎯',
    category: 'balloonPop',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'speed_demon',
    title: 'Speedy Cheetah',
    desc: 'Reach 25+ WPM in Speedy Racer!',
    icon: '🏎️',
    category: 'speedyRacer',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'racer_champion',
    title: 'Grand Prix Winner',
    desc: 'Win a Speedy Racer race against the rival car!',
    icon: '🏆',
    category: 'speedyRacer',
    color: 'from-yellow-400 to-amber-500'
  },
  {
    id: 'space_defender',
    title: 'Cosmic Guardian',
    desc: 'Blast 5 alien invaders in Space Blaster!',
    icon: '🚀',
    category: 'spaceBlaster',
    color: 'from-purple-400 to-violet-600'
  },
  {
    id: 'laser_master',
    title: 'Galaxy Commander',
    desc: 'Score 200+ points in Space Blaster!',
    icon: '⭐',
    category: 'spaceBlaster',
    color: 'from-emerald-400 to-teal-600'
  },
  {
    id: 'star_collector',
    title: 'Super Star',
    desc: 'Earn 30 total stars across all games!',
    icon: '🌟',
    category: 'all',
    color: 'from-amber-300 to-yellow-500'
  },
  {
    id: 'streak_master',
    title: 'On Fire!',
    desc: 'Maintain a 3-game playing streak!',
    icon: '🔥',
    category: 'all',
    color: 'from-red-400 to-orange-500'
  },
  {
    id: 'keyboard_wizard',
    title: 'Keyboard Wizard',
    desc: 'Type over 100 total words!',
    icon: '🧙‍♂️',
    category: 'all',
    color: 'from-cyan-400 to-blue-600'
  },
  {
    id: 'fruit_ninja',
    title: 'Fruit Slicer',
    desc: 'Score 100+ points in Fruit Slicer!',
    icon: '🍉',
    category: 'fruitSlicer',
    color: 'from-emerald-400 to-green-600'
  },
  {
    id: 'dino_rider',
    title: 'Jurassic Jumper',
    desc: 'Score 100+ points in Dino Runner!',
    icon: '🦖',
    category: 'dinoRunner',
    color: 'from-lime-400 to-emerald-600'
  },
  {
    id: 'combo_king',
    title: 'Combo Legend',
    desc: 'Reach a 5x typing combo in any game!',
    icon: '⚡',
    category: 'all',
    color: 'from-amber-400 to-yellow-500'
  }
];

export const AVATARS_LIST = [
  { id: 'bunny', emoji: '🐰', name: 'Bouncing Bunny', color: 'bg-pink-100 text-pink-600' },
  { id: 'tiger', emoji: '🐯', name: 'Turbo Tiger', color: 'bg-amber-100 text-amber-600' },
  { id: 'bear', emoji: '🐻', name: 'Buddy Bear', color: 'bg-orange-100 text-orange-600' },
  { id: 'fox', emoji: '🦊', name: 'Flash Fox', color: 'bg-rose-100 text-rose-600' },
  { id: 'panda', emoji: '🐼', name: 'Pixel Panda', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'alien', emoji: '👾', name: 'Astro Alien', color: 'bg-purple-100 text-purple-600' },
  { id: 'robot', emoji: '🤖', name: 'Robo Buddy', color: 'bg-sky-100 text-sky-600' },
  { id: 'dragon', emoji: '🐲', name: 'Daring Dragon', color: 'bg-teal-100 text-teal-600' }
];

const defaultUserData = {
  stars: 12, // Starting bonus stars to excite kids
  streak: 1,
  lastPlayedDate: new Date().toISOString().split('T')[0],
  highScores: {
    balloonPop: 0,
    speedyRacer: 0,
    spaceBlaster: 0,
    fruitSlicer: 0,
    dinoRunner: 0,
  },
  unlockedBadges: ['first_pop'],
  soundEnabled: true,
  selectedAvatar: 'bunny',
  stats: {
    totalWordsTyped: 0,
    totalKeysPressed: 0,
    bestWPM: 0,
    gamesPlayed: 0
  }
};

export const getStoredUserData = () => {
  if (typeof window === 'undefined') return defaultUserData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUserData(defaultUserData);
      return defaultUserData;
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaultUserData,
      ...parsed,
      highScores: { ...defaultUserData.highScores, ...(parsed.highScores || {}) },
      stats: { ...defaultUserData.stats, ...(parsed.stats || {}) }
    };
  } catch {
    return defaultUserData;
  }
};

export const saveUserData = (data) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

// Check if any new badges should be unlocked
export const checkBadgeUnlocks = (currentData) => {
  const newUnlocked = new Set(currentData.unlockedBadges || []);
  const newlyEarnedBadges = [];

  const checkAndAdd = (badgeId, condition) => {
    if (condition && !newUnlocked.has(badgeId)) {
      newUnlocked.add(badgeId);
      const badgeInfo = BADGES_LIST.find(b => b.id === badgeId);
      if (badgeInfo) newlyEarnedBadges.push(badgeInfo);
    }
  };

  const { highScores, stats, stars, streak } = currentData;

  checkAndAdd('first_pop', (highScores.balloonPop > 0));
  checkAndAdd('home_row_hero', (highScores.balloonPop >= 100));
  checkAndAdd('speed_demon', (stats.bestWPM >= 25));
  checkAndAdd('racer_champion', (highScores.speedyRacer >= 100));
  checkAndAdd('space_defender', (highScores.spaceBlaster >= 50));
  checkAndAdd('laser_master', (highScores.spaceBlaster >= 200));
  checkAndAdd('fruit_ninja', ((highScores.fruitSlicer || 0) >= 100));
  checkAndAdd('dino_rider', ((highScores.dinoRunner || 0) >= 100));
  checkAndAdd('star_collector', (stars >= 30));
  checkAndAdd('streak_master', (streak >= 3));
  checkAndAdd('keyboard_wizard', (stats.totalWordsTyped >= 100));

  if (newlyEarnedBadges.length > 0) {
    currentData.unlockedBadges = Array.from(newUnlocked);
    // Award 5 bonus stars for every unlocked badge!
    currentData.stars += newlyEarnedBadges.length * 5;
    saveUserData(currentData);
  }

  return { updatedData: currentData, newlyEarnedBadges };
};

// Record a game session result
export const recordGameResult = ({ gameId, score = 0, starsEarned = 0, wordsTyped = 0, keysPressed = 0, wpm = 0 }) => {
  const data = getStoredUserData();
  
  // Update stars
  data.stars = (data.stars || 0) + starsEarned;
  
  // Update game high score
  if (!data.highScores) data.highScores = {};
  if (score > (data.highScores[gameId] || 0)) {
    data.highScores[gameId] = score;
  }

  // Update stats
  data.stats.totalWordsTyped = (data.stats.totalWordsTyped || 0) + wordsTyped;
  data.stats.totalKeysPressed = (data.stats.totalKeysPressed || 0) + keysPressed;
  data.stats.gamesPlayed = (data.stats.gamesPlayed || 0) + 1;
  if (wpm > (data.stats.bestWPM || 0)) {
    data.stats.bestWPM = Math.round(wpm);
  }

  // Check streaks
  const today = new Date().toISOString().split('T')[0];
  if (data.lastPlayedDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (data.lastPlayedDate === yesterday) {
      data.streak = (data.streak || 1) + 1;
    } else {
      data.streak = 1;
    }
    data.lastPlayedDate = today;
  }

  // Check badges
  const { updatedData, newlyEarnedBadges } = checkBadgeUnlocks(data);
  saveUserData(updatedData);

  return { updatedData, newlyEarnedBadges };
};
