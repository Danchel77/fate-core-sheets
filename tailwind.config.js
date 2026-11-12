/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#000000', raised: '#0d0d0d', frame: '#1a1a1a' },
        panel: '#141414',
        line: '#292319',
        gold: { DEFAULT: '#987849', light: '#a68354', dim: '#775e39' },
        wine: '#37242c',
        text: { DEFAULT: '#e8e8e8', muted: '#a8a090' },
        danger: '#b0493f',
        warn: '#c9a227',
      },
      fontFamily: {
        fantasy: ['"Cinzel"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
