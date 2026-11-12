/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        text: "#D1D5DB", // slate-300
        gold: "#987849",
        gray: "#1A1A1A",
      },
      fontFamily: {
        fantasy: ['"Cinzel"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
