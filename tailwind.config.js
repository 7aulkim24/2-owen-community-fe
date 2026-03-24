/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.html',
    './js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        background: '#10141a',
        surface: '#181c22',
        'surface-high': '#262a31',
        primary: '#a3c9ff',
        'primary-container': '#57a5ff',
        secondary: '#7bdb80',
        'on-surface': '#dfe2eb',
        'on-surface-variant': '#c0c7d4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Space Grotesk', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
  corePlugins: {
    preflight: false,
  },
};
