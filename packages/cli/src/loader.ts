/**
 * Loads a .sheet.tsx / .sheet.ts file at runtime.
 *
 * esbuild transpiles the TSX to JS in-memory, then we write it to a temp
 * file and dynamic-import it. This avoids needing ts-node or tsx in PATH.
 *
 * When a live backend is supplied, rendering is done in two passes:
 *   1. Collection pass — useRange() records addresses, returns []
 *   2. After prefetch — useRange() returns real rows from cache
 * Both passes share state via globalThis (works across esbuild-bundled copies).
 */

import { build } from 'esbuild'
import { writeFile, unlink, mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { SheetDefinition, SheetNode, WorkbookNode } from 'nextsheet'
import {
  startCollecting,
  stopCollecting,
  populateCache,
  clearRangeCache,
  enterFormulaMode,
  exitFormulaMode,
} from 'nextsheet'
import type { Backend } from 'nextsheet/backends'

type SheetModule = {
  default: SheetDefinition | SheetNode | WorkbookNode | ((...args: unknown[]) => SheetNode)
}

// The CLI package has nextsheet in its own node_modules — use that for resolution.
// new URL('..', import.meta.url) goes one level up from dist/index.js → packages/cli/
const CLI_DIR = new URL('..', import.meta.url).pathname

async function transpile(filePath: string): Promise<string> {
  const result = await build({
    entryPoints: [filePath],
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    jsxImportSource: 'nextsheet',
    write: false,
    // exceljs is only needed at render time (xlsx adapter), not at definition time.
    // Bundling nextsheet makes the output self-contained regardless of pnpm workspace topology.
    external: ['exceljs'],
    logLevel: 'silent',
    nodePaths: [join(CLI_DIR, 'node_modules')],
  })

  const output = result.outputFiles[0]
  if (output === undefined) throw new Error(`esbuild produced no output for ${filePath}`)
  return output.text
}

type Renderer = () => SheetNode | WorkbookNode

function resolveRenderer(mod: SheetModule['default'], label: string): Renderer {
  if (typeof mod === 'function') {
    return mod as () => SheetNode
  }
  if ('_type' in mod && (mod as SheetDefinition)._type === 'SheetDefinition') {
    const def = mod as SheetDefinition
    return () => {
      const node = def.render() as SheetNode
      return node.name === 'Sheet' ? { ...node, name: def.name } : node
    }
  }
  if ('kind' in mod) {
    // Static node (WorkbookNode or SheetNode exported directly) — can't re-render,
    // but static nodes don't use useRange so a single pass is fine.
    return () => mod as SheetNode | WorkbookNode
  }
  throw new Error(
    `[nextsheet] Default export of "${label}" must be a SheetDefinition (defineSheet), ` +
      'a SheetNode, or a function component.'
  )
}

export interface LoadWorkbookOptions {
  /** Activate formula transpilation (xlsx / spreadsheet targets). */
  formulaMode?: boolean
}

export async function loadWorkbook(
  filePaths: string[],
  name = 'Workbook',
  backend?: Backend,
  opts: LoadWorkbookOptions = {}
): Promise<WorkbookNode> {
  const renderers: Renderer[] = []
  const cacheDir = join(process.cwd(), '.nextsheet', 'cache')
  await mkdir(cacheDir, { recursive: true })

  // ── Phase 1: transpile all files and load modules ─────────────────────────
  for (const filePath of filePaths) {
    const absPath = resolve(process.cwd(), filePath)
    const code = await transpile(absPath)
    const tmpFile = join(cacheDir, `sheet_${Date.now()}.mjs`)
    await writeFile(tmpFile, code, 'utf8')

    try {
      const mod = (await import(pathToFileURL(tmpFile).href)) as SheetModule
      if (mod.default === undefined) {
        throw new Error(
          `[nextsheet] "${filePath}" has no default export. ` +
            'Export a sheet via defineSheet(), a function component, or workbook().'
        )
      }
      renderers.push(resolveRenderer(mod.default, filePath))
    } finally {
      await unlink(tmpFile).catch(() => undefined)
    }
  }

  // ── Phase 2: prefetch live ranges (only when backend is provided) ─────────
  if (backend) {
    // Collection pass — useRange() records all addresses, returns []
    startCollecting()
    for (const render of renderers) render()
    const addresses = stopCollecting()

    if (addresses.size > 0) {
      const cache = new Map<string, unknown[]>()
      await Promise.all(
        [...addresses].map(async (addr) => {
          cache.set(addr, await backend.fetchRange(addr))
        })
      )
      populateCache(cache)
    }
  }

  // ── Phase 3: final render pass ────────────────────────────────────────────
  const sheets: SheetNode[] = []
  for (const render of renderers) {
    if (opts.formulaMode) {
      // Discovery render: get column names to build the formula address map.
      const discovery = render()
      if (discovery.kind === 'workbook') {
        sheets.push(...(discovery as WorkbookNode).sheets)
        continue
      }
      const discoverySheet = discovery as SheetNode
      enterFormulaMode(discoverySheet.columns)
      try {
        const result = render()
        if (result.kind === 'workbook') {
          sheets.push(...(result as WorkbookNode).sheets)
        } else {
          sheets.push(result as SheetNode)
        }
      } finally {
        exitFormulaMode()
      }
    } else {
      const result = render()
      if (result.kind === 'workbook') {
        sheets.push(...(result as WorkbookNode).sheets)
      } else {
        sheets.push(result as SheetNode)
      }
    }
  }

  if (backend) clearRangeCache()

  return { kind: 'workbook', name, sheets }
}
