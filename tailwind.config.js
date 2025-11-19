/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./public/**/*.{html,js}",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
      colors: {
        "nexus-dark": "#000000",
        "nexus-cyan": "#0891b2", // cyan-600
      },
    },
  },
  plugins: [],
};
