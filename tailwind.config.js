/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        yard: {
          green: '#1b4d3e',
          dark: '#0f2f25',
          light: '#2d6a4f',
          mint: '#d8f3dc',
          accent: '#52b788',
          gold: '#d4a373',
          earth: '#7f5539',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 25px -5px rgba(27, 77, 62, 0.08), 0 8px 10px -6px rgba(27, 77, 62, 0.05)',
      }
    },
  },
  plugins: [],
}
