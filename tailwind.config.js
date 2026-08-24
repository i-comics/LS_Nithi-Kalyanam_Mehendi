/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        royal: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7E22CE',
          800: '#6b21a8',
          900: '#581c87'
        },
        cream: {
          50: '#fffdf9',
          100: '#fdf8ee',
          200: '#faf0d9',
          300: '#f5e6c3'
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        body: ['"Poppins"', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(126, 34, 206, 0.35)'
      }
    }
  },
  plugins: []
}
