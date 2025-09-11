/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        "sans-instrument": ["Instrument Sans"],
        inter: ["Inter"],
        barlow: ["Barlow", "sans-serif"],
      },
      colors: {
        primary: "#CC0000",
        secondary: "#222222",
      },
    },
    container: {
      center: true,
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
