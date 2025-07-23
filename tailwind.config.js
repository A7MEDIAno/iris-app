/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nordvik-inspirert grønn palett
        'nordvik': {
          50: '#e6f3f0',
          100: '#c0e2d9',
          200: '#96d0bf',
          300: '#6cbea5',
          400: '#4db092',
          500: '#2da27f',
          600: '#279474',
          700: '#1f8267',
          800: '#18705a',
          900: '#0b5142', // Dyp grønn (hovedfarge)
          950: '#063d33'
        },
        // Pholio-inspirert mørkt tema
        'dark': {
          50: '#f7f7f8',
          100: '#ececed',
          200: '#d4d4d6',
          300: '#ababae',
          400: '#7a7a7f',
          500: '#5a5a5f',
          600: '#48484d',
          700: '#3a3a3f',
          800: '#2a2a2f',
          900: '#1a1a1f',
          950: '#0f0f13'
        }
      },
    },
  },
  plugins: [],
}