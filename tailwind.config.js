import lynxPreset from '@lynx-js/tailwind-preset';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [lynxPreset],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'jakarta', 'sans-serif'],
        body: ['Inter', 'inter', 'sans-serif'],
        sans: ['Inter', 'inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1A73E8',
          dark: '#1557B0',
          light: '#E8F0FE',
          50: '#E8F0FE',
          100: '#D2E3FC',
          500: '#1A73E8',
          600: '#1557B0',
          700: '#0D47A1',
        },
        secondary: {
          DEFAULT: '#FFC107',
          dark: '#E0A800',
          light: '#FFF8E1',
          50: '#FFF8E1',
          400: '#FFC107',
          600: '#E0A800',
        },
        success: {
          DEFAULT: '#28A745',
          50: '#E6F4EA',
          500: '#28A745',
          700: '#1E7E34',
        },
        warning: {
          DEFAULT: '#FFC107',
          50: '#FFF8E1',
          500: '#FFC107',
          700: '#856404',
        },
        error: {
          DEFAULT: '#DC3545',
          50: '#FDE8E9',
          500: '#DC3545',
          700: '#A71D2A',
        },
        info: {
          DEFAULT: '#1A73E8',
          50: '#E8F0FE',
          500: '#1A73E8',
          700: '#1557B0',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9AA0A6',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          900: '#202124',
        },
        canvas: '#F9FAFB',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        divider: '#F3F4F6',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
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
    },
  },
};
