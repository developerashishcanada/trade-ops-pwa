/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7f9',
          100: '#dbebf0',
          500: '#2c7a90',
          600: '#236b82',
          700: '#1c5568',
        }
      }
    },
  },
  plugins: [],
}