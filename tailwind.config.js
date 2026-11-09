/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hub: {
          bg: '#0F141C',
          surface: '#171D27',
          surfaceHover: '#1E2532',
          border: '#252E3E',
          accent: '#C99738',
          accentHover: '#DBA843',
        },
        witcher: {
          dark: '#0F141C',
          card: '#171D27',
          cardHover: '#1E2532',
          border: '#252E3E',
          borderActive: '#C99738',
          gold: '#C99738',
          goldLight: '#DBA843',
          crimson: '#DC2626',
          crimsonLight: '#EF4444',
          slate: '#94A3B8',
          parchment: '#EDE8D5',
        }
      },
      fontFamily: {
        fantasy: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
