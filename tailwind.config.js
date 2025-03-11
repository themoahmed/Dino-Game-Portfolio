/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pulpo: ["var(--font-pulpo)"],
      },
      colors: {
        brown: {
          DEFAULT: "603913",
          light: 'AC885B'
        },
      },
    },
  },
  plugins: [],
};
