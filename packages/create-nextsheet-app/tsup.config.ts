import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  banner: { js: '#!/usr/bin/env node' },
  dts: false,
  sourcemap: false,
  clean: true,
  external: ['@clack/prompts', 'picocolors'],
})
