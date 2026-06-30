/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F3EC',
        ink: '#2B2A26',
        teal: { DEFAULT: '#2E7D6F', dark: '#256457', light: '#3E9B8A' },
        gold: { DEFAULT: '#C9A227', light: '#E0C158' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: { xl2: '1.25rem' }
    }
  },
  plugins: []
};
