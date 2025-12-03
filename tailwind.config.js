/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FDFBF7',
        beige: {
          100: '#F5F5DC',
          200: '#E8E4C9',
          300: '#D3D3A0',
        },
        pastel: {
          pink: '#FFD1DC',
          blue: '#AEC6CF',
          green: '#77DD77',
          lavender: '#E6E6FA',
        },
        paper: '#FDFBF7',
        ink: '#2C2C2C',
        leather: {
          brown: '#8B4513',
          dark: '#5D2906',
          light: '#A0522D',
        },
        gold: '#FFD700',
      },
      fontFamily: {
        handwriting: ['"Dancing Script"', 'cursive'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'book': '10px 10px 30px rgba(0, 0, 0, 0.1), -10px -10px 30px rgba(255, 255, 255, 0.8)',
        'page': '2px 0 5px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
