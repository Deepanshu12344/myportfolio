/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          black: '#090909',
          900: '#0b0b0c',
          850: '#0e0e10',
          800: '#121215',
          700: '#16161a',
          600: '#1c1c21',
          500: '#232329',
          400: '#2c2c33',
          300: '#3a3a42',
        },
        term: {
          green: '#00ff9c',
          'green-dim': '#0bbf73',
          'green-soft': '#7af7c4',
          blue: '#3b82f6',
          'blue-dim': '#1d4ed8',
          'blue-soft': '#93c5fd',
          'blue-bright': '#60a5fa',
          amber: '#fbbf24',
          red: '#ff5c5c',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 0 1px rgba(0,255,156,0.15), 0 0 24px -6px rgba(0,255,156,0.35)',
        'glow-blue': '0 0 0 1px rgba(59,130,246,0.2), 0 0 24px -6px rgba(59,130,246,0.35)',
        'card': '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 0 0 1px rgba(255,255,255,0.04), 0 12px 40px -12px rgba(0,0,0,0.6)',
        'card-light': '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
        'radial-fade':
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,255,156,0.08), transparent 70%)',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        blink: 'blink 1.1s steps(1) infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        scan: 'scan 8s linear infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        pulseGlow: 'pulseGlow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
