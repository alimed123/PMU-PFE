/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        textblue: '#1C5D99',    // e.g., deep blue
        backgroundlight: '#EAEFF5',  // e.g., amber
        accent: '#10B981',     // e.g., emerald
      },
  },
  plugins: [],
}
}

