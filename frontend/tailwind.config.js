/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "light-background": "#FFFFFF",
        "light-text": "#000000",
        "light-gray": "#DBDBDB",
        "light-darkgray": "#737373",

        "dark-background": "#000000",
        "dark-text": "#FAFAFA",
        "dark-gray": "#262626",
        "dark-darkgray": "#8E8E8E",

        blue: "#0095F6",
        purple: "#4D00FF",
        error: "#FF0000",
      },
      fontFamily: {
        sans: ["Roboto", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-short": "pulse 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
