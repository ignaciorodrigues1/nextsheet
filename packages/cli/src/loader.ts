/**
 * Loads a .sheet.tsx / .sheet.ts file at runtime.
 *
 * esbuild transpiles the TSX to JS in-memory, then we write it to a temp
 * file and dynamic-import it. This avoids needing ts-node or tsx in PATH.
 */

import { build } from 'esbuild'
import { writeFile, unlink, mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { SheetDefinition, SheetNode, WorkbookNode } from 'nextsheet'

type SheetModule = {
  default: SheetDefinition | SheetNode | WorkbookNode | ((...args: unknown[]) => SheetNode)
}

// The CLI package has nextsheet in its own node_modules — use that for resolution.
const CLI_DIR = new URL('../..', import.meta.url).pathname

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

function resolveSheetNode(mod: SheetModule['default'], label: string): SheetNode {
  if (typeof mod === 'function') return (mod as () => SheetNode)()
  if ('_type' in mod && (mod as SheetDefinition)._type === 'SheetDefinition') {
    const def = mod as SheetDefinition
    const node = def.render()
    // The defineSheet name takes precedence over the <Sheet> default name.
    return node.name === 'Sheet' ? { ...node, name: def.name } : node
  }
  if ('kind' in mod && (mod as SheetNode).kind === 'sheet') return mod as SheetNode
  throw new Error(
    `[nextsheet] Default export of "${label}" must be a SheetDefinition (defineSheet), ` +
      'a SheetNode, or a function component.'
  )
}

export async function loadWorkbook(filePaths: string[], name = 'Workbook'): Promise<WorkbookNode> {
  const sheets: SheetNode[] = []
  // Write temp files inside the project so node_modules resolution works.
  const cacheDir = join(process.cwd(), '.nextsheet', 'cache')
  await mkdir(cacheDir, { recursive: true })

  for (const filePath of filePaths) {
    const absPath = resolve(process.cwd(), filePath)
    const code = await transpile(absPath)

    // Cache-bust via timestamp so reloads always pick up fresh code.
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

      // A file may export a full WorkbookNode — spread its sheets in.
      const exp = mod.default
      if (typeof exp === 'object' && exp !== null && 'kind' in exp && (exp as WorkbookNode).kind === 'workbook') {
        sheets.push(...(exp as WorkbookNode).sheets)
      } else {
        sheets.push(resolveSheetNode(exp as Exclude<typeof exp, WorkbookNode>, filePath))
      }
    } finally {
      await unlink(tmpFile).catch(() => undefined)
    }
  }

  return { kind: 'workbook', name, sheets }
}
