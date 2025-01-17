/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'abiotic': '#1a365d',      // Deep blue for chemical stage
        'protocell': '#166534',    // Green for early life
        'basic-cell': '#854d0e',   // Bronze for basic cellular
        'complex-cell': '#7e22ce', // Purple for advanced cellular
        'multi-cell': '#be123c',   // Red for multicellular
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
}
