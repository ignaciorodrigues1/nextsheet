import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve, basename } from 'node:path'
import type { Command } from 'commander'
import type { Adapter, BuildTarget } from 'nextsheet'
import { csvAdapter, xlsxAdapter, superSheetAdapter } from 'nextsheet'
import { log } from '../logger.js'
import { loadWorkbook } from '../loader.js'
import { loadConfig } from '../config-loader.js'
import { renderWorkbookHTML } from '../preview/render.js'
import { resolveBackend, backendOptions } from '../backends/resolve.js'
import { loadEnv } from '../env.js'

type ExtendedTarget = BuildTarget | 'supersheet' | 'html'

function resolveAdapter(target: ExtendedTarget): Adapter | null {
  switch (target) {
    case 'csv':        return csvAdapter
    case 'xlsx':       return xlsxAdapter
    case 'supersheet': return superSheetAdapter
    case 'html':       return null
    case 'google':
    case 'excel-online':
      throw new Error(`[nextsheet] Target "${target}" requires the deploy command (v0.3+).`)
  }
}

function defaultOut(input: string, extension: string, target: ExtendedTarget): string {
  if (target === 'supersheet') {
    return resolve(process.cwd(), 'nextsheet.output.json')
  }
  if (target === 'html') {
    return resolve(process.cwd(), 'dist', 'index.html')
  }
  const base = basename(input).replace(/\.sheet\.(tsx?|jsx?)$/, '')
  return resolve(process.cwd(), 'dist', `${base}.${extension}`)
}

export function buildCommand(program: Command): void {
  const cmd = program
    .command('build <files...>')
    .description('Compile sheet files to a spreadsheet format.')
    .option('-t, --target <target>', 'output target: csv | xlsx | html | supersheet', 'csv')
    .option('-o, --out <path>', 'output file path')
    .option('-n, --name <name>', 'workbook name', 'Workbook')

  for (const [flag, desc] of backendOptions) cmd.option(flag, desc)

  cmd.action(async (files: string[], opts: {
    target: string
    out?: string
    name: string
    googleSpreadsheetId?: string
    googleAccessToken?: string
    googleCredentials?: string
    microsoftToken?: string
    driveItemId?: string
  }) => {
      const target = opts.target as ExtendedTarget
      const adapter = resolveAdapter(target)

      loadEnv('production')
      await loadConfig()
      const backend = resolveBackend(opts)
      if (backend) log.dim(`Using backend: ${backend.name}`)
      log.info(`Building ${files.length} sheet(s) → ${target}`)

      const formulaMode = target === 'xlsx' || target === 'supersheet'

      try {
        const wb = await loadWorkbook(files, opts.name, backend, { formulaMode })

        let outPath: string
        let data: string | Buffer

        if (target === 'html') {
          const html = renderWorkbookHTML(wb, 0)
          outPath = opts.out ?? defaultOut(files[0]!, 'html', target)
          data = html
        } else {
          const result = await adapter!.render(wb)
          outPath = opts.out ?? defaultOut(files[0]!, result.extension, target)
          data = result.data
        }

        await mkdir(dirname(outPath), { recursive: true })
        await writeFile(outPath, data)

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
