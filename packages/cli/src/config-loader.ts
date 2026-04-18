/**
 * Loads nextsheet.config.ts / nextsheet.config.js from the project root.
 * Uses the same esbuild pipeline as the sheet loader so TS/JSX works out of the box.
 */

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { build } from 'esbuild'
import { writeFile, unlink, mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import type { NextSheetConfig } from 'nextsheet'
import { setActiveConfig } from 'nextsheet'

const CLI_DIR = new URL('..', import.meta.url).pathname

const CONFIG_NAMES = [
  'nextsheet.config.ts',
  'nextsheet.config.mts',
  'nextsheet.config.js',
  'nextsheet.config.mjs',
]

export async function loadConfig(): Promise<NextSheetConfig | null> {
  const cwd = process.cwd()
  const configPath = CONFIG_NAMES.map((f) => join(cwd, f)).find(existsSync)
  if (configPath === undefined) return null

  const cacheDir = join(cwd, '.nextsheet', 'cache')
  await mkdir(cacheDir, { recursive: true })

  const result = await build({
    entryPoints: [configPath],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    logLevel: 'silent',
    nodePaths: [join(CLI_DIR, 'node_modules')],
  })

  const code = result.outputFiles[0]?.text
  if (code === undefined) return null

  const tmpFile = join(cacheDir, `config_${Date.now()}.mjs`)
  await writeFile(tmpFile, code, 'utf8')
  try {
    const mod = await import(pathToFileURL(tmpFile).href)
    const config = (mod.default ?? {}) as NextSheetConfig
    setActiveConfig(config)
    return config
  } finally {
    await unlink(tmpFile).catch(() => undefined)
  }
}
