/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bbd5ff',
          300: '#8cb9ff',
          400: '#5593ff',
          500: '#4facfe',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e3a8a',
          900: '#172554',
        },
         surface: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            600: '#334155',
            700: '#1e293b',
           800: '#1a1f2e',
           850: '#151923',
           900: '#0f1219',
           950: '#0a0d14',
         },
      },
      fontFamily: {
        quicksand: ['Quicksand', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
