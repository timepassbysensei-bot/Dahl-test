/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#12335B',
          dark: '#0B2442',
          light: '#245A8D',
        },
        gold: {
          DEFAULT: '#D99500',
          light: '#F5B82E',
          dark: '#B87A00',
        },
        offwhite: '#F8FAFC',
        lightgray: '#E5E7EB',
        ink: {
          DEFAULT: '#172033',
          muted: '#64748B',
        },
        success: '#15803D',
        warning: '#B45309',
        error: '#B91C1C',
      },
      fontFamily: {
        heading: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(18, 51, 91, 0.08), 0 4px 12px rgba(18, 51, 91, 0.06)',
        'card-hover': '0 2px 6px rgba(18, 51, 91, 0.12), 0 8px 24px rgba(18, 51, 91, 0.1)',
        pop: '0 4px 16px rgba(11, 36, 66, 0.18)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      letterSpacing: {
        tightest: '-0.02em',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'toast-in': 'toastIn 0.25s ease-out',
        'drawer-in': 'drawerIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        drawerIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}