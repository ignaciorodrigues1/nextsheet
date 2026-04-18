import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:       '#0a0a0a',
        surface:  '#111111',
        'surface-2': '#181818',
        border:   '#222222',
        'border-2': '#2e2e2e',
        text:     '#e8e8e8',
        'text-dim': '#888888',
        'text-muted': '#555555',
        accent:   '#ffffff',
        blue:     '#7c9fff',
        green:    '#22c55e',
        teal:     '#0f766e',
      },
      fontFamily: {
        mono: ['\'SF Mono\'', '\'Fira Code\'', '\'Cascadia Code\'', 'Menlo', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '\'Segoe UI\'', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
