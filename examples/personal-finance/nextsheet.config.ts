import { defineConfig } from 'nextsheet'

export default defineConfig({
  theme: {
    colors: {
      primary:    '#0f766e',  // teal-700 — professional finance feel
      background: '#ffffff',
      text:       '#0f172a',
      headerText: '#ffffff',
      border:     '#e2e8f0',
      muted:      '#64748b',
    },
    typography: {
      fontFamily:     'Inter',
      fontSize:       12,
      headerFontSize: 20,
    },
    sheet: {
      columnWidth: 22,
    },
  },
})
