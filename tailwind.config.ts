import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(27 36 48 / 0.04), 0 2px 4px -2px rgb(27 36 48 / 0.04)',
        elevated:
          '0 2px 6px 0 rgb(27 36 48 / 0.06), 0 8px 24px -8px rgb(27 36 48 / 0.08)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 240ms ease-out',
        'scale-in': 'scale-in 160ms ease-out',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        optimalskatt: {
          'base-100': '#FBF8F1',
          'base-200': '#F3EEE3',
          'base-300': '#E7DFCE',
          'base-content': '#1B2430',
          primary: '#1F3A5F',
          'primary-content': '#FBF8F1',
          secondary: '#B08A3E',
          'secondary-content': '#1B2430',
          accent: '#7D3C2E',
          'accent-content': '#FBF8F1',
          neutral: '#2B3440',
          'neutral-content': '#F3EEE3',
          info: '#2C5E8A',
          'info-content': '#FBF8F1',
          success: '#3F7D5B',
          'success-content': '#FBF8F1',
          warning: '#B8823C',
          'warning-content': '#1B2430',
          error: '#A0392B',
          'error-content': '#FBF8F1',
          '--rounded-box': '0.75rem',
          '--rounded-btn': '0.375rem',
          '--rounded-badge': '9999px',
          '--animation-btn': '0.2s',
          '--border-btn': '1px',
          '--tab-border': '1px',
          '--tab-radius': '0.375rem',
        },
      },
    ],
    darkTheme: 'optimalskatt',
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};

export default config;
