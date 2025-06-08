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
        arabic: ["var(--font-arabic)", "sans-serif"],
        latin: ["var(--font-latin)", "sans-serif"],
        mukta: ["var(--font-mukta)", "sans-serif"],
      },
      screens: {
        xs: { max: "400px" },
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
