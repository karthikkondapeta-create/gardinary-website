/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef5ee',
          100: '#d3e5d4',
          200: '#a8cbab',
          300: '#7cb080',
          400: '#4f9556',
          500: '#357a3c',
          600: '#26612d',
          700: '#1d4a23',
          800: '#15351a',
          900: '#0d2110',
          950: '#071309',
        },
        ink: {
          900: '#0a0b09',
          800: '#121410',
          700: '#1a1d17',
          600: '#25291f',
        },
        bone: '#e9e4d8',
      },
      fontFamily: {
        display: ['"Anton"', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'botanical-fade': 'radial-gradient(ellipse at top, rgba(38,97,45,0.35), transparent 60%)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
      },
    },
  },
  plugins: [],
}
