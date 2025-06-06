// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // wherever your JSX/TSX lives; e.g.:
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Now you have utility classes: font-arabic, font-latin, font-mukta
        arabic: ["var(--font-arabic)", "sans-serif"],
        latin: ["var(--font-latin)", "sans-serif"],
        mukta: ["var(--font-mukta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
