export default {
  darkMode: 'class',
  content: ['./src/**/*.{svelte,ts}'],
  theme: {
    extend: {
      colors: {
        app: 'var(--app-bg)',
        surface: 'var(--app-surface)',
        muted: 'var(--app-surface-muted)',
        border: 'var(--app-border)',
        text: 'var(--app-text)',
        'text-muted': 'var(--app-text-muted)',
        'text-soft': 'var(--app-text-soft)',
        link: 'var(--app-link)',
        selected: 'var(--app-selected-bg)',
        'selected-text': 'var(--app-selected-text)',
        accent: 'var(--app-accent)',
        'accent-hover': 'var(--app-accent-hover)',
        chip: 'var(--app-chip)',
        campus: {
          ink: '#17212b',
          blue: '#003C71',
          lightBlue: '#0085CA',
          darkBlue: '#00203C',
          gold: '#FFCD00',
          blue10: 'rgba(0, 60, 113, 0.10)',
          blue15: 'rgba(0, 60, 113, 0.15)',
          blue70: 'rgba(0, 60, 113, 0.70)',
          paper: '#F3F7FB',
          line: '#D5E0EA',
          green: '#2E7D5B',
          red: '#B42318'
        }
      },
      fontFamily: {
        sans: ['Aptos', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
