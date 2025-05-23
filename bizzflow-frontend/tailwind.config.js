/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{html,md}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8', // deep blue
        accent: '#F59E0B',  // saffron
        light: '#F3F4F6',   // light background
        dark: '#2F3A4A',   // dark background
        success: '#34C759', // success green
        warning: '#F7DC6F', // warning yellow
        error: '#FF3737',   // error red
      },
      spacing: {
        128: '32rem',
        144: '36rem',
        160: '40rem',
        176: '44rem',
        192: '48rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
    },
  },
  plugins: [],
}
