// Kid-friendly word pools and letter sets categorized by skill and difficulty

export const HOME_ROW_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l'];

export const ALPHABET_KEYS = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];

export const EASY_WORDS = [
  'cat', 'dog', 'sun', 'hat', 'cup', 'red', 'big', 'run', 'sky', 'hop',
  'bat', 'jam', 'fox', 'pig', 'bee', 'cow', 'car', 'toy', 'bus', 'pen',
  'box', 'ice', 'key', 'pie', 'sea', 'ant', 'egg', 'owl', 'map', 'nut'
];

export const MEDIUM_WORDS = [
  'star', 'moon', 'duck', 'frog', 'bird', 'fish', 'lion', 'bear', 'tree', 'park',
  'book', 'game', 'fast', 'jump', 'cake', 'milk', 'play', 'blue', 'pink', 'glow',
  'snow', 'rain', 'wind', 'smile', 'happy', 'sweet', 'magic', 'candy', 'puppy', 'tiger'
];

export const SPACE_WORDS = [
  'mars', 'star', 'moon', 'zoom', 'nova', 'ship', 'beam', 'alien', 'comet',
  'orbit', 'laser', 'solar', 'astro', 'earth', 'rocket', 'galaxy', 'meteor',
  'nebula', 'planet', 'cosmic', 'shuttle', 'gravity', 'blaster', 'starlight'
];

export const RACER_WORDS = [
  'go', 'fast', 'race', 'car', 'road', 'turn', 'drift', 'dash', 'speed', 'turbo',
  'track', 'wheel', 'brake', 'drive', 'boost', 'pedal', 'champion', 'victory',
  'streak', 'engine', 'finish', 'circuit', 'lightning', 'accelerate'
];

export const SENTENCES = [
  'the sun is bright',
  'a happy brown fox',
  'stars shine at night',
  'we love typing games',
  'the cute cat can jump',
  'rockets fly to the moon',
  'typing is fun and easy',
  'speedy cars zoom past',
  'rainbow in the blue sky'
];

// Helper to get random item from array
export const getRandomItem = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// Key position finger hints for kids
export const KEYBOARD_FINGER_MAP = {
  // Left pinky
  'q': { finger: 'Left Pinky', color: 'bg-rose-400' },
  'a': { finger: 'Left Pinky', color: 'bg-rose-400' },
  'z': { finger: 'Left Pinky', color: 'bg-rose-400' },
  '1': { finger: 'Left Pinky', color: 'bg-rose-400' },
  
  // Left ring
  'w': { finger: 'Left Ring', color: 'bg-amber-400' },
  's': { finger: 'Left Ring', color: 'bg-amber-400' },
  'x': { finger: 'Left Ring', color: 'bg-amber-400' },
  '2': { finger: 'Left Ring', color: 'bg-amber-400' },

  // Left middle
  'e': { finger: 'Left Middle', color: 'bg-emerald-400' },
  'd': { finger: 'Left Middle', color: 'bg-emerald-400' },
  'c': { finger: 'Left Middle', color: 'bg-emerald-400' },
  '3': { finger: 'Left Middle', color: 'bg-emerald-400' },

  // Left index
  'r': { finger: 'Left Index', color: 'bg-sky-400' },
  't': { finger: 'Left Index', color: 'bg-sky-400' },
  'f': { finger: 'Left Index', color: 'bg-sky-400' },
  'g': { finger: 'Left Index', color: 'bg-sky-400' },
  'v': { finger: 'Left Index', color: 'bg-sky-400' },
  'b': { finger: 'Left Index', color: 'bg-sky-400' },
  '4': { finger: 'Left Index', color: 'bg-sky-400' },
  '5': { finger: 'Left Index', color: 'bg-sky-400' },

  // Thumbs
  ' ': { finger: 'Thumbs', color: 'bg-indigo-400' },

  // Right index
  'y': { finger: 'Right Index', color: 'bg-sky-400' },
  'u': { finger: 'Right Index', color: 'bg-sky-400' },
  'h': { finger: 'Right Index', color: 'bg-sky-400' },
  'j': { finger: 'Right Index', color: 'bg-sky-400' },
  'n': { finger: 'Right Index', color: 'bg-sky-400' },
  'm': { finger: 'Right Index', color: 'bg-sky-400' },
  '6': { finger: 'Right Index', color: 'bg-sky-400' },
  '7': { finger: 'Right Index', color: 'bg-sky-400' },

  // Right middle
  'i': { finger: 'Right Middle', color: 'bg-emerald-400' },
  'k': { finger: 'Right Middle', color: 'bg-emerald-400' },
  ',': { finger: 'Right Middle', color: 'bg-emerald-400' },
  '8': { finger: 'Right Middle', color: 'bg-emerald-400' },

  // Right ring
  'o': { finger: 'Right Ring', color: 'bg-amber-400' },
  'l': { finger: 'Right Ring', color: 'bg-amber-400' },
  '.': { finger: 'Right Ring', color: 'bg-amber-400' },
  '9': { finger: 'Right Ring', color: 'bg-amber-400' },

  // Right pinky
  'p': { finger: 'Right Pinky', color: 'bg-rose-400' },
  ';': { finger: 'Right Pinky', color: 'bg-rose-400' },
  '/': { finger: 'Right Pinky', color: 'bg-rose-400' },
  '0': { finger: 'Right Pinky', color: 'bg-rose-400' },
};
