/** @type {import('tailwindcss').Config} */
/* npm run dev */ 
/* npx tailwindcss -i ./src/assets/tailwind.css -o ./src/assets/tailwind_output.css --watch */

const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    extend: {
    }
  },
  plugins: [
    // require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),  /* <input type="email" class="form-input px-1 py-1 rounded" /> */
    require('@tailwindcss/line-clamp')  /* <p class="line-clamp-3 md:line-clamp-none"></p> */
    // require('@tailwindcss/aspect-ratio')
  ],
}
