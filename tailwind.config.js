/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
      colors: {
        brand: {
          sky: '#38bdf8',
          skyLight: '#e0f2fe',
          yellow: '#fbbf24',
          yellowLight: '#fef3c7',
          mint: '#34d399',
          mintLight: '#d1fae5',
          purple: '#a78bfa',
          purpleLight: '#ede9fe',
          pink: '#f472b6',
          pinkLight: '#fce7f3',
          orange: '#fb923c',
          orangeLight: '#ffedd5',
          dark: '#1e1b4b',
        }
      },
      animation: {
        'bounce-soft': 'bounceSoft 2s infinite ease-in-out',
        'float-slow': 'floatSlow 4s infinite ease-in-out',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.6))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.3))' },
        }
      }
    },
  },
  plugins: [],
}

