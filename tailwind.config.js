/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        velaris: {
          bg: '#0A0510',
          card: '#150B21',
          cardHover: '#1E0F30',
          border: 'rgba(212, 175, 55, 0.25)',
          gold: '#D4AF37',
          goldLight: '#F5E4A0',
          goldDark: '#997B20',
          goldGradient: 'linear-gradient(135deg, #F5E4A0 0%, #D4AF37 50%, #A37F1D 100%)',
          plum: '#26123D',
          textMuted: '#9CA3AF',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.2)',
        'gold-glow-lg': '0 0 35px rgba(212, 175, 55, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(180deg, #10061A 0%, #08030D 100%)',
        'gold-button': 'linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #997A15 100%)',
        'gold-button-hover': 'linear-gradient(135deg, #FFF0B8 0%, #E5BE42 50%, #B28F20 100%)',
        'glass-card': 'linear-gradient(135deg, rgba(38, 18, 61, 0.6) 0%, rgba(20, 9, 33, 0.7) 100%)',
      }
    },
  },
  plugins: [],
}
