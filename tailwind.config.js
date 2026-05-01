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
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmerMove 1.5s infinite linear',
        'fade-in': 'fadeIn 0.2s ease-out both',
      },
    },
  },
};
