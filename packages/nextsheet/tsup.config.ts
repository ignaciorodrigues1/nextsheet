import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'jsx-runtime': 'src/jsx-runtime.ts',
    'adapters/csv': 'src/adapters/csv.ts',
    'adapters/xlsx': 'src/adapters/xlsx.ts',
    'adapters/supersheet': 'src/adapters/supersheet.ts',
    backends: 'src/backends/index.ts',
    agent: 'src/agent/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ['exceljs'],
})
