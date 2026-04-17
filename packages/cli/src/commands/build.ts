import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve, basename } from 'node:path'
import type { Command } from 'commander'
import type { Adapter, BuildTarget } from 'nextsheet'
import { csvAdapter, xlsxAdapter, superSheetAdapter } from 'nextsheet'
import { log } from '../logger.js'
import { loadWorkbook } from '../loader.js'

type ExtendedTarget = BuildTarget | 'supersheet'

function resolveAdapter(target: ExtendedTarget): Adapter {
  switch (target) {
    case 'csv':        return csvAdapter
    case 'xlsx':       return xlsxAdapter
    case 'supersheet': return superSheetAdapter
    case 'google':
    case 'excel-online':
      throw new Error(`[nextsheet] Target "${target}" requires the deploy command (v0.3+).`)
  }
}

function defaultOut(input: string, extension: string, target: ExtendedTarget): string {
  if (target === 'supersheet') {
    // Convention: always output to nextsheet.output.json at project root
    return resolve(process.cwd(), 'nextsheet.output.json')
  }
  const base = basename(input).replace(/\.sheet\.(tsx?|jsx?)$/, '')
  return resolve(process.cwd(), 'dist', `${base}.${extension}`)
}

export function buildCommand(program: Command): void {
  program
    .command('build <files...>')
    .description('Compile sheet files to a spreadsheet format.')
    .option('-t, --target <target>', 'output target: csv | xlsx | supersheet', 'csv')
    .option('-o, --out <path>', 'output file path')
    .option('-n, --name <name>', 'workbook name', 'Workbook')
    .action(async (files: string[], opts: { target: string; out?: string; name: string }) => {
      const target = opts.target as ExtendedTarget
      const adapter = resolveAdapter(target)

      log.info(`Building ${files.length} sheet(s) → ${target}`)

      try {
        const wb = await loadWorkbook(files, opts.name)
        const result = await adapter.render(wb)

        const outPath = opts.out ?? defaultOut(files[0]!, result.extension, target)
        await mkdir(dirname(outPath), { recursive: true })
        await writeFile(outPath, result.data)

        log.success(`Written to ${outPath}`)

        if (target === 'supersheet') {
          log.dim(
            `  Commit this file to Git, then import the repo in SuperSheet.\n` +
            `  Or run: nextsheet deploy --target supersheet`
          )
        }
      } catch (err) {
        log.error(err instanceof Error ? err.message : String(err))
        process.exit(1)
      }
    })
}
