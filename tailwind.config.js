/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* NextWork brand */
        paper: '#F8F5F1',
        leather: '#1B1918',
        sand: '#E5DCC7',
        'leather-elevated': '#2D2A28',
        /* Legacy / semantic (kept for compatibility) */
        'deep-dark': '#1B1918',
        'card-dark': '#2D2A28',
        'hover-gray': '#282828',
        'accent-orange': '#FF6B35',
        'success-green': '#1ED760',
        'warning-amber': '#FFA726',
        'spotify-green': '#1DB954',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B3B3B3',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        'roboto-condensed': ['Roboto Condensed', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'spotify-glow': '0 0 20px rgb(29, 185, 84, 0.3)',
        'accent-glow': '0 0 24px rgb(255, 107, 53, 0.25)',
        'card-elevated': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.15)',
      },
      screens: {
        xs: '380px',
      },
    },
  },
  plugins: [],
}
