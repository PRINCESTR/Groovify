/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zwp: {
          green: '#1db954',
          'green-hover': '#1ed760',
          black: '#000000',
          dark: '#121212',
          card: '#181818',
          'card-hover': '#282828',
          text: '#ffffff',
          'text-sub': '#b3b3b3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
