import { heroui } from '@heroui/react';

export default heroui({
  defaultTheme: 'light',
  themes: {
    light: {
      colors: {
        background: '#F4F8FF',
        foreground: '#0F172A',
        primary: {
          50: '#eef6ff',
          100: '#e0efff',
          200: '#bae0ff',
          300: '#7cc6ff',
          400: '#38a8ff',
          500: '#0b78e3',
          600: '#0056c2',
          700: '#004aad',
          800: '#003a88',
          900: '#002d6b',
          DEFAULT: '#004AAD',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#38BDF8',
          foreground: '#082F49',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#422006',
        },
        success: {
          DEFAULT: '#059669',
          foreground: '#ffffff',
        },
      },
    },
  },
});
