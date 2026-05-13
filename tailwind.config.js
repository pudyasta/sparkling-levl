import lynxPreset from '@lynx-js/tailwind-preset';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [lynxPreset],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        error: 'var(--error)',
        neutral: 'var(--neutral)',
        background: 'var(--background)',
        disabled: 'var(--disabled)',
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        muted: 'var(--text-muted)',
        subtle: 'var(--text-subtle)',
      },
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
      fontSize: {
        caption: ['var(--text-caption)', { lineHeight: 'var(--leading-caption)' }],
        display: ['var(--text-display)', { lineHeight: 'var(--leading-display)' }],
      },
    },
  },
};
