/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        witcher: {
          dark: '#0B0E14',
          card: '#161B22',
          cardHover: '#1F242C',
          border: '#2E3440',
          borderActive: '#D97706',
          gold: '#D97706',
          goldLight: '#F59E0B',
          crimson: '#DC2626',
          crimsonLight: '#EF4444',
          slate: '#8F9BB3',
          parchment: '#EDE8D5',
        }
      },
      fontFamily: {
        fantasy: ['Cinzel', 'Marcellus', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
