/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          dark: '#1a0f0a',
          brown: '#2c1810',
          red: '#8B0000',
          'red-light': '#a00000',
          'red-dark': '#5a0000',
          beige: '#F5F5DC',
          'beige-dark': '#D4C5A9',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        mono: ['Courier New', 'monospace'],
      },
      animation: {
        'flicker': 'flicker 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'door-open': 'doorOpen 0.5s ease-out forwards',
        'handle-shake': 'handleShake 0.3s ease-in-out',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(139, 0, 0, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(139, 0, 0, 0.8)' },
        },
        doorOpen: {
          '0%': { transform: 'perspective(1000px) rotateY(0deg)' },
          '100%': { transform: 'perspective(1000px) rotateY(-90deg)' },
        },
        handleShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)' },
          '75%': { transform: 'translateX(3px)' },
        },
      },
    },
  },
  plugins: [],
}

