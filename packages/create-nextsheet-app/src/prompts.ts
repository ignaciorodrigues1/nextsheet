import {
  intro,
  outro,
  text,
  select,
  confirm,
  isCancel,
  cancel,
  note,
} from '@clack/prompts'
import pc from 'picocolors'

export interface ProjectOptions {
  name: string
  useTypeScript: boolean
  linter: 'eslint' | 'biome' | 'none'
  exampleSheets: boolean
  backend: 'none' | 'google' | 'excel-online'
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun'
  install: boolean
}

const RECOMMENDED: Omit<ProjectOptions, 'name' | 'packageManager' | 'install'> = {
  useTypeScript: true,
  linter: 'eslint',
  exampleSheets: true,
  backend: 'none',
}

function detectPackageManager(): 'npm' | 'pnpm' | 'yarn' | 'bun' {
  const agent = process.env['npm_config_user_agent'] ?? ''
  if (agent.startsWith('pnpm')) return 'pnpm'
  if (agent.startsWith('yarn')) return 'yarn'
  if (agent.startsWith('bun')) return 'bun'
  return 'npm'
}

function abort(): never {
  cancel('Cancelled.')
  process.exit(0)
}

function guard<T>(value: T | symbol): T {
  if (isCancel(value)) abort()
  return value as T
}

function validateName(v: string): string | undefined {
  const trimmed = v.trim()
  if (!trimmed) return 'Project name is required'
  if (!/^[a-z0-9@._/-]+$/.test(trimmed)) return 'Use lowercase letters, numbers, hyphens, or slashes'
  return undefined
}

export async function gatherOptions(argv: string[]): Promise<ProjectOptions> {
  const nameArg = argv.find((a) => !a.startsWith('-'))
  const useYes = argv.includes('--yes') || argv.includes('-y')
  const pm = detectPackageManager()

  intro(pc.bold(pc.cyan(' create-nextsheet-app ')))

  // ── Project name ──────────────────────────────────────────────────────────
  let name: string
  if (nameArg) {
    const err = validateName(nameArg)
    if (err) { cancel(err); process.exit(1) }
    name = nameArg
  } else {
    name = guard(
      await text({
        message: 'What is your project named?',
        placeholder: 'my-workbook',
        validate: validateName,
      })
    ) as string
  }

  // ── Defaults or customize ─────────────────────────────────────────────────
  if (useYes) {
    note(
      [
        `TypeScript  ${pc.green('yes')}`,
        `Linter      ${pc.green('ESLint')}`,
        `Examples    ${pc.green('yes')}`,
        `Backend     ${pc.dim('none')}`,
      ].join('\n'),
      'Using recommended defaults'
    )
    return { name, ...RECOMMENDED, packageManager: pm, install: true }
  }

  const mode = guard(
    await select({
      message: 'How would you like to set up your project?',
      options: [
        {
          value: 'recommended',
          label: 'Use recommended defaults',
          hint: 'TypeScript · ESLint · example sheets',
        },
        { value: 'customize', label: 'Customize settings' },
      ],
    })
  ) as string

  if (mode === 'recommended') {
    return { name, ...RECOMMENDED, packageManager: pm, install: true }
  }

  // ── Customize ─────────────────────────────────────────────────────────────
  const useTypeScript = guard(
    await confirm({ message: 'Would you like to use TypeScript?', initialValue: true })
  ) as boolean

  const linter = guard(
    await select({
      message: 'Which linter would you like to use?',
      options: [
        { value: 'eslint', label: 'ESLint', hint: 'recommended' },
        { value: 'biome',  label: 'Biome',  hint: 'fast, opinionated' },
        { value: 'none',   label: 'None' },
      ],
    })
  ) as 'eslint' | 'biome' | 'none'

  const exampleSheets = guard(
    await confirm({ message: 'Would you like example sheets?', initialValue: true })
  ) as boolean

  const backend = guard(
    await select({
      message: 'Would you like to configure a live backend?',
      options: [
        { value: 'none',         label: 'None',          hint: 'static builds only' },
        { value: 'google',       label: 'Google Sheets', hint: 'live data via Sheets API' },
        { value: 'excel-online', label: 'Excel Online',  hint: 'live data via Microsoft Graph' },
      ],
    })
  ) as 'none' | 'google' | 'excel-online'

  const packageManager = guard(
    await select({
      message: 'Which package manager would you like to use?',
      options: [
        { value: 'pnpm', label: 'pnpm', hint: pm === 'pnpm' ? 'detected' : undefined },
        { value: 'npm',  label: 'npm',  hint: pm === 'npm'  ? 'detected' : undefined },
        { value: 'yarn', label: 'yarn', hint: pm === 'yarn' ? 'detected' : undefined },
        { value: 'bun',  label: 'bun',  hint: pm === 'bun'  ? 'detected' : undefined },
      ],
      initialValue: pm,
    })
  ) as 'npm' | 'pnpm' | 'yarn' | 'bun'

  return { name, useTypeScript, linter, exampleSheets, backend, packageManager, install: true }
}

export { outro, note }
