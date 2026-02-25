/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#c68b58",
        "background-light": "#FDF8F1",
        "bone-white": "#F9F6F2",
        "espresso": "#2C1E1A",
        "caramel": "#C68B59",
        "light": "#FDF8F1",
      },
      fontFamily: {
        "display": ["Work Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      zIndex: {
        "1000": "1000",
      }
    },
  },
  plugins: [],
}
