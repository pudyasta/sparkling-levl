import lynxPreset from '@lynx-js/tailwind-preset';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [lynxPreset],
  theme: {
  extend: {
    keyframes: {
      shimmerMove: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
      },
    },
  },
},
};
