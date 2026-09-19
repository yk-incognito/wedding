/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fall: {
          '0%': { transform: 'translateY(-10%) rotate(0deg)', opacity: '0.9' },
          '100%': { transform: 'translateY(110vh) rotate(360deg)', opacity: '0' },
        }
      },
      animation: {
        'fall-slow': 'fall 8s linear infinite',
        'fall-medium': 'fall 5s linear infinite',
      }
    },
  },
  plugins: [],
}
