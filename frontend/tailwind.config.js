/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        morphos: {
          bg: '#050505',
          surface: '#0A0A0A',
          card: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.10)',
          orange: '#FF7A00',
          amber: '#FF9D3D',
          primary: '#F5F5F5',
          secondary: '#8A8A8A',
          muted: '#555555',
        },
      },
      boxShadow: {
        'glow-orange': '0 0 35px rgba(255, 122, 0, 0.28)',
        'glow-orange-lg': '0 0 60px rgba(255, 122, 0, 0.35)',
        'glow-orange-sm': '0 0 16px rgba(255, 122, 0, 0.22)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit': 'spin 20s linear infinite',
      },
    },
  },
  plugins: [],
};
