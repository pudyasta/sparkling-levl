/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#1A73E8',
        secondary: '#FFC107',
        accent: '#E8F0FE',
        success: '#28A745',
        error: '#DC3545',
        neutral: '#202124',
      },
      fontFamily: {
        inter: ['Inter'],
        jakarta: ['PlusJakartaSans'],
      },
    },
  },
  plugins: [],
};
