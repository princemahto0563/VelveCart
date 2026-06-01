/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c9a96e',
          light: '#dfc28e',
          dark: '#b8860b',
          dim: 'rgba(201,169,110,0.15)',
        },
        velvet: {
          black: '#0a0a0a',
          surface: '#141210',
          card: '#1a1816',
          cream: '#f5f0e8',
          beige: '#ede8df',
          muted: '#8a8580',
          sub: '#6b6560',
        },
        rose: '#d4a0a0',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.15em',
        widest: '0.25em',
      },
      boxShadow: {
        luxury: '0 20px 60px rgba(0,0,0,0.08)',
        'luxury-lg': '0 40px 80px rgba(0,0,0,0.12)',
        gold: '0 4px 24px rgba(201,169,110,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.4,0,0.2,1) forwards',
        'marquee': 'marquee 20s linear infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
