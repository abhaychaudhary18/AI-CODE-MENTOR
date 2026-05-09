/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-dark': '#0D1117',
        'panel-dark': '#161B22',
        'editor-dark': '#1E1E1E',
        'border-main': '#30363D',
        'accent-primary': '#58A6FF',
        'success-green': '#3FB950',
        'warning-orange': '#F0883E',
        'text-main': '#E6EDF3',
        'text-dim': '#8B949E',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'premium': '16px',
      },
    },
  },
  plugins: [],
}
