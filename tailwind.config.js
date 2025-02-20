/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,css,jsx,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        honey: '#FFA500',   
        spice: '#8B4513',   
      },
      
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

