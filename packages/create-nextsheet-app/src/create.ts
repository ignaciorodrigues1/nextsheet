import { mkdir, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { spinner, log } from '@clack/prompts'
import type { ProjectOptions } from './prompts.js'
import * as t from './templates.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function isDirEmpty(dir: string): Promise<boolean> {
  try {
    const entries = await readdir(dir)
    return entries.length === 0
  } catch {
    return true
  }
}

function installCommand(pm: string): { cmd: string; args: string[] } {
  switch (pm) {
    case 'yarn': return { cmd: 'yarn', args: [] }
    case 'bun':  return { cmd: 'bun',  args: ['install'] }
    default:     return { cmd: pm,     args: ['install'] }
  }
}

function runProcess(cmd: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn([cmd, ...args].join(' '), { cwd, stdio: 'inherit', shell: true })
    child.on('close', (code: number | null) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} exited with code ${code ?? 1}`))
    })
    child.on('error', reject)
  })
}

// ─── File manifest ────────────────────────────────────────────────────────────

function buildManifest(opts: ProjectOptions): Array<[string, string]> {
  const ext = opts.useTypeScript ? 'tsx' : 'jsx'
  const files: Array<[string, string]> = [
    ['package.json',          t.packageJson(opts)],
    ['nextsheet.config.ts',   t.nextsheetConfig()],
    ['.gitignore',            t.gitignore()],
    ['.env.example',          t.envExample(opts)],
    ['.env.local',            t.envLocal(opts)],
    ['README.md',             t.readme(opts)],
  ]

  if (opts.useTypeScript) {
    files.push(['tsconfig.json', t.tsconfigJson()])
  }

  if (opts.linter === 'eslint') {
    files.push(['eslint.config.js', t.eslintConfig(opts)])
  }
  if (opts.linter === 'biome') {
    files.push(['biome.json', t.biomeConfig()])
  }

  if (opts.exampleSheets) {
    files.push([`sheets/Sales.sheet.${ext}`, t.exampleSheet(opts)])
  }

  return files
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function createProject(opts: ProjectOptions): Promise<string> {
  const dir = resolve(process.cwd(), opts.name)

  // Guard: existing non-empty directory
  if (existsSync(dir) && !(await isDirEmpty(dir))) {
    log.error(`Directory "${opts.name}" already exists and is not empty.`)
    log.info('Choose a different name or remove the directory first.')
    process.exit(1)
  }

  const s = spinner()

  // ── Write files ───────────────────────────────────────────────────────────
  s.start('Creating project files…')
  try {
    await mkdir(join(dir, 'sheets'), { recursive: true })

    const manifest = buildManifest(opts)
    await Promise.all(
      manifest.map(([rel, content]) =>
        writeFile(join(dir, rel), content, 'utf8')
      )
    )
    s.stop(`${manifest.length} files written`)
  } catch (err) {
    s.stop('Failed to write files')
    throw err
  }

  // ── Install deps ──────────────────────────────────────────────────────────
  if (opts.install) {
    s.start(`Installing dependencies with ${opts.packageManager}…`)
    try {
      const { cmd, args } = installCommand(opts.packageManager)
      await runProcess(cmd, args, dir)
      s.stop('Dependencies installed')
    } catch (err) {
      s.stop('Install failed — run it manually')
      log.warn(String(err))
    }
  }

  return dir
}
