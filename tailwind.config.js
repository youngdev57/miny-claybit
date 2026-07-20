/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#111827',
        signal: '#f97316',
        skyline: '#0f172a',
      },
      boxShadow: {
        panel: '0 20px 70px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
