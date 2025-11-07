// diff-viewer/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'git-add': '#22863a',
        'git-delete': '#cb2431',
        'git-modify': '#e36209',
      }
    },
  },
  plugins: [],
}