/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0C0E', // app background
          900: '#101114',
          850: '#141519', // card surface
          800: '#1B1D22', // raised surface (inputs, inner panels)
          700: '#232529', // soft border
          600: '#2A2D33', // border
          500: '#3A3D44',
        },
        text: {
          primary: '#EDEEF0',
          secondary: '#9297A1',
          tertiary: '#63676F',
        },
        accent: {
          DEFAULT: '#5B7FFF',
          dim: '#31406E',
          soft: '#1B2440',
        },
        danger: {
          DEFAULT: '#F2555A',
          soft: '#3A1E20',
        },
        success: {
          DEFAULT: '#34D399',
          soft: '#123028',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '14px',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        fadeUp: 'fadeUp 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
