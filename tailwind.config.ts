import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        neon: '0 0 20px rgba(56, 189, 248, 0.25), 0 0 40px rgba(59, 130, 246, 0.15)',
      },
      colors: {
        neon: {
          blue: '#0ea5e9',
          pink: '#ec4899',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
        },
      },
    },
  },
  plugins: [],
};

export default config;
