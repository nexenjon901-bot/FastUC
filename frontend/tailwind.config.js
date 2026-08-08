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
          DEFAULT: '#0f111a',
          card: '#16192b',
          card2: '#1d2138',
        },
        accent: {
          indigo: '#5a67d8',
          violet: '#7c3aed',
        },
        success: '#10b981',
        warning: '#facc15',
        danger: '#f43f5e',
        primary: '#ffffff',
        secondary: '#94a3b8',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #6366f1, #7c3aed)',
        'card-gradient': 'linear-gradient(145deg, #16192b, #1d2138)',
      },
    },
  },
  plugins: [],
}
