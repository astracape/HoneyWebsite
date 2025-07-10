/** @type {import('tailwindcss').Config} */
export default {
  content:
   ["./dist/index.html","./src/**/*.{html,js,css,jsx,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        honey: '#FFA500',   
        spice: '#8B4513',   
        brandyellow: '#D7951F'
      },
      
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

