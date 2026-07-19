/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0c1e',
          card: '#141631',
          card2: '#171933',
        },
        accent: {
          indigo: '#6366f1',
          violet: '#7c3aed',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#f43f5e',
        primary: '#f1f5f9',
        secondary: '#94a3b8',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #6366f1, #7c3aed)',
        'card-gradient': 'linear-gradient(145deg, #141631, #171933)',
      },
    },
  },
  plugins: [],
}
