/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#1a1f36',
        secondary: '#f5f0e8',
        accent: '#c0603a',
        background: '#faf9f7',
        card: '#ffffff',
        border: '#e8e3db',
        muted: '#8a8580',
        success: '#2d7a4f',
        warning: '#d97706',
        error: '#dc2626',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
