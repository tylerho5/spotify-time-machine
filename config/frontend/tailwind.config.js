/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1db954',
          'green-hover': '#1ed760',
          dark: '#191414',
          gray: '#b3b3b3',
        }
      },
      fontFamily: {
        'spotify': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'spotify': '16px',
        'button': '24px',
      },
      backdropBlur: {
        'spotify': '10px',
      }
    },
  },
  plugins: [],
}
