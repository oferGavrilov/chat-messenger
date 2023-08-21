/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        dark: '0 9px 14px 1px #082818',
      },
      fontFamily: {
        'sf-regular': ['sf-pro-display', 'sans-serif'],
        lilita: ['Lilita', 'cursive', 'bold'],
        alfa: ['Alfa Slab One', 'sans-serif'],
      },
      dropShadow: {
        'primary': 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px #84a98c)'
      },
      colors: {
        'dark-primary-bg': '#111b21',
        'dark-secondary-bg': '#202c33',
        'dark-default-hover-bg': '#495057',
        'dark-dropdown-bg': '#233138',
        'dark-navigation-bg': '#212529',
        'dark-outgoing-chat-bg':'#005c4b',
        'dark-incoming-chat-bg':'#202c33',
        'dark-primary-text': '#ffffff',
        'navigation-bg': '#FAFAFA',
        'primary': '#0099ff',
        'secondary-text': '#242424',
      }
    },

  },
  plugins: [],
}

