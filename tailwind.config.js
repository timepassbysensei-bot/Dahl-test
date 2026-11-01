/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F4F1EA',
        ink: '#0E0C15',
        'ink-soft': '#13101E',
        obsidian: '#0C0914',
        plum: '#1F133D',
        purple: {
          DEFAULT: '#6D3DF2',
          light: '#7C4DFF',
          deep: '#5B2BE0',
        },
        muted: '#6E6A7C',
        line: 'rgba(14, 12, 21, 0.12)',
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        editorial: '0.14em',
        tightest: '-0.045em',
      },
      // Extra alpha steps used across the editorial surfaces.
      opacity: {
        12: '0.12',
        15: '0.15',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
      },
      borderRadius: {
        bento: '1.75rem',
        sheet: '2rem',
      },
      boxShadow: {
        float: '0 40px 80px -50px rgba(14, 12, 21, 0.55)',
        purple: '0 30px 70px -40px rgba(109, 61, 242, 0.75)',
        drawer: '0 40px 100px -40px rgba(14, 12, 21, 0.45)',
      },
      maxWidth: {
        editorial: '78rem',
      },
    },
  },
  plugins: [],
}
