# 🎮 TypingGames - Playful Children's Typing Learning App

A gamified, interactive, and colorful web application built with **React**, **Vite**, and **Tailwind CSS** designed to help children master touch typing skills through fun, fast-paced mini-games!

![TypingGames Banner](https://img.shields.io/badge/TypingGames-Kids%20Learning-pink?style=for-the-badge&logo=gamepad)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## ✨ Features

- **🎈 Balloon Pop (Letter Recognition & Home Row):**
  - Balloons float gently into the sunny sky with letters and simple words.
  - Hitting the matching key pops the balloon with particle explosions, floating points, combo multipliers, and sound effects.
  - Practice modes: Home Row only (`ASDF JKL;`), All Alphabet (`A-Z`), or Easy Words.

- **🏎️ Speedy Racer (Word Typing & WPM Speed):**
  - Character racecar racing across a horizontal track against an animated AI rival car.
  - Sequential word typing engine accelerates the racer with nitro boost flames!
  - Real-time speedometer gauge tracking live Words Per Minute (WPM) and accuracy.

- **🚀 Space Blaster (Sentence & Vocabulary):**
  - Cosmic deep space atmosphere with descending alien UFO invaders.
  - Targeting reticle locks onto alien ships as you type words/phrases.
  - Completing the phrase fires a laser cannon from your starship to vaporize invaders before they hit your planetary shields.

- **⌨️ Interactive Virtual Keyboard:**
  - Color-coded finger zones (Pinky = Rose, Ring = Amber, Middle = Mint, Index = Sky).
  - Real-time visual feedback on pressed keys and home row anchor bumps on `F` and `J`.

- **🏆 Gamification & Rewards:**
  - **Trophy & Badge Cabinet:** 9 unlockable achievement badges (e.g. *Home Row Hero*, *Speedy Cheetah*, *Grand Prix Winner*, *Cosmic Guardian*).
  - **Mascot Buddy Selector:** 8 cute avatars to cheer on young typists (*Turbo Tiger*, *Bouncing Bunny*, *Pixel Panda*, *Flash Fox*, etc.).
  - **Celebration Modals:** Confetti bursts, star ratings (1–3 stars), and score breakdowns.
  - **Persistent LocalStorage:** Saves stars, daily streaks, high scores, and statistics across browser sessions.

- **🔊 Synthesized Web Audio API:**
  - Zero-latency sound effects (pops, laser zaps, turbo whooshes, fanfare) synthesized directly in-browser with zero external asset dependencies.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Suneel-rgb/TypingGames.git
   cd TypingGames
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

### Production Build

To build the production-ready bundle:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS with custom playful pastel palettes and 3D buttons
- **Icons:** `lucide-react`
- **Effects & Animations:** `canvas-confetti`, custom CSS keyframes, and Web Audio API
- **Fonts:** Google Fonts (*Fredoka* & *Quicksand*)

---

## 📄 License

MIT License. Designed with ❤️ for young learners everywhere!
