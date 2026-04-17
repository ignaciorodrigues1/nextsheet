/**
 * .env file loader — same priority model as Next.js.
 *
 * Load order (lowest → highest priority):
 *   .env                    base, commit to git
 *   .env.{mode}             mode-specific (development | production)
 *   .env.local              local overrides, add to .gitignore
 *   .env.{mode}.local       local mode-specific overrides
 *
 * Shell environment variables always win — they are never overwritten.
 * Variables are injected into process.env and are accessible via
 * process.env.MY_VAR inside .sheet.tsx files.
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { log } from './logger.js'

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseLine(line: string): [string, string] | null {
  const trimmed = line.trim()

  // Skip blank lines and comments
  if (!trimmed || trimmed.startsWith('#')) return null

  // Strip leading "export "
  const raw = trimmed.startsWith('export ') ? trimmed.slice(7).trimStart() : trimmed

  const eqIdx = raw.indexOf('=')
  if (eqIdx === -1) return null

  const key = raw.slice(0, eqIdx).trim()
  // Keys must be valid identifiers
  if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return null

  let value = raw.slice(eqIdx + 1)

  // Double-quoted: unescape \n \r \t \\
  if (value.startsWith('"')) {
    const close = value.lastIndexOf('"')
    if (close > 0) {
      value = value
        .slice(1, close)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\')
        .replace(/\\"/g, '"')
    } else {
      value = value.slice(1)
    }
  // Single-quoted: literal, no escaping
  } else if (value.startsWith("'")) {
    const close = value.lastIndexOf("'")
    value = close > 0 ? value.slice(1, close) : value.slice(1)
  // Unquoted: trim whitespace, strip inline comment
  } else {
    const commentIdx = value.indexOf(' #')
    value = (commentIdx !== -1 ? value.slice(0, commentIdx) : value).trim()
  }

  return [key, value]
}

function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const pair = parseLine(line)
    if (pair) result[pair[0]] = pair[1]
  }
  return result
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export type EnvMode = 'development' | 'production'

export function loadEnv(mode: EnvMode): void {
  const cwd = process.cwd()

  const files = [
    '.env',
    `.env.${mode}`,
    '.env.local',
    `.env.${mode}.local`,
  ]

  const merged: Record<string, string> = {}
  const loaded: string[] = []

  for (const name of files) {
    const fullPath = resolve(cwd, name)
    if (!existsSync(fullPath)) continue
    try {
      Object.assign(merged, parseEnvFile(readFileSync(fullPath, 'utf8')))
      loaded.push(name)
    } catch {
      log.warn(`Could not read ${name}`)
    }
  }

  if (loaded.length === 0) return

  let injected = 0
  for (const [key, value] of Object.entries(merged)) {
    // Shell vars take highest priority — never overwrite
    if (process.env[key] === undefined) {
      process.env[key] = value
      injected++
    }
  }

  log.dim(
    `  env: ${loaded.join(', ')} → ${injected} var${injected !== 1 ? 's' : ''} loaded`
  )
}
