/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: '#2C4E6B',
        cream: '#F5F2E8',
        marble: '#FAF8F3',
        stone: '#E8E5DC',
        darkNavy: '#1a2f42',
      },
      fontFamily: {
        serif: ['Crimson Pro', 'Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'greek': '8px 8px 0 0 rgba(44, 78, 107, 0.2)',
        'greek-hover': '12px 12px 0 0 rgba(44, 78, 107, 0.3)',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}