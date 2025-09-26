/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
    // Optional: Include any additional file types if you use them
    // './src/**/*.{html,vue,md}',
    // './src/**/*.css', // If you have CSS files with Tailwind classes
  ],
  theme: {
    extend: {
      // You can extend the default theme here
      // colors: {
      //   'custom-blue': '#1e40af',
      // },
      // fontFamily: {
      //   'custom': ['Inter', 'sans-serif'],
      // },
    },
  },
  plugins: [
    // You can add Tailwind plugins here
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};
