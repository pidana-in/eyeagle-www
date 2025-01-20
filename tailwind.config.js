/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily:{
        'sans-instrument':['Instrument Sans'],
        'inter':['Inter']
      },
      
    },
    container:{
      center:true
    }
  },
  plugins: [],
}

