import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#05070b',
        panel: 'rgba(12, 18, 29, 0.72)',
        line: 'rgba(148, 163, 184, 0.2)',
        cyan: '#24d7ff',
        amber: '#f8b84e',
        danger: '#ff4d67',
        success: '#31d98b'
      },
      boxShadow: {
        glow: '0 0 40px rgba(36, 215, 255, 0.16)',
        danger: '0 0 28px rgba(255, 77, 103, 0.2)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif']
      },
      screens: {
        '3xl': '1800px'
      }
    }
  },
  plugins: []
};

export default config;
