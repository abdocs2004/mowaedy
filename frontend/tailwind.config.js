/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Cairo', 'Tahoma', 'Arial', 'sans-serif'] },
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#5b9dff',
          500: '#2d7dfd', 600: '#0d6efd', 700: '#0a58ca', 800: '#0a3f96', 900: '#152548',
        },
        ink: { DEFAULT: '#152548', soft: '#334155', muted: '#64748b' },
        surface: { DEFAULT: '#ffffff', muted: '#f8fafc', sunken: '#f1f5f9' },
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.05), 0 4px 16px rgb(15 23 42 / 0.06)',
        pop: '0 10px 40px rgb(15 23 42 / 0.18)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(-100%)' } },
      },
      animation: { 'fade-in': 'fade-in .2s ease-out', 'slide-up': 'slide-up .25s ease-out' },
    },
  },
  plugins: [],
};
