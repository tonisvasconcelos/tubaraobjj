/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern, lighter grey palette
        'primary-dark': '#1f2937', // Dark grey for headers and important elements
        'secondary-dark': '#374151', // Medium dark for text
        'light-bg': '#f9fafb', // Very light grey for backgrounds
        'card-bg': '#ffffff', // Pure white for cards
        'border-gray': '#e5e7eb', // Light grey for borders
        'text-gray': '#6b7280', // Medium grey for secondary text
        'accent-gray': '#9ca3af', // Light grey for accents (matching logo)
        'hover-gray': '#d1d5db', // Light grey for hover states
        'dark-text': '#111827', // Dark grey for primary text
      },
    },
  },
  plugins: [],
}
