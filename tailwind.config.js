/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neutral scale — ~90% of the interface lives here.
        ink: {
          950: '#090A0D', // app background
          900: '#0D0F13', // recessed media wells (clip thumbnails before render)
          850: '#111318', // primary surface — cards, panels
          800: '#171A20', // elevated surface — inputs, secondary buttons
          700: '#1B1E25', // subtle dividers / inner tracks
          600: '#252932', // border
          500: '#353A45', // border — hover
        },
        text: {
          primary: '#F4F4F6',
          secondary: '#A6A9B2',
          tertiary: '#686C76',
        },
        // Mighty Blue — used intentionally, not decoratively: brand, primary
        // actions, focus/active states, and anything AI/progress-related.
        accent: {
          DEFAULT: '#6685FF',
          hover: '#7D98FF',
          highlight: '#B8C3FF',
        },
        // Champagne — reserved for the Top Pick / exceptional-moment treatment.
        // Never a background, never a button.
        premium: {
          DEFAULT: '#C8B68A',
        },
        danger: {
          DEFAULT: '#F05A60',
          soft: '#2B1518',
        },
        success: {
          DEFAULT: '#3DD6A0',
          soft: '#0F2B24',
        },
        warning: {
          DEFAULT: '#E8B65A',
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
