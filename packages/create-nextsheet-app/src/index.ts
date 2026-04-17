import { outro, note } from '@clack/prompts'
import pc from 'picocolors'
import { gatherOptions } from './prompts.js'
import { createProject } from './create.js'
import { relative } from 'node:path'

const argv = process.argv.slice(2)

if (argv.includes('--help') || argv.includes('-h')) {
  console.log(`
  ${pc.bold('create-nextsheet-app')} [project-name] [options]

  Options:
    --yes, -y       Use recommended defaults without prompts
    --help, -h      Show this message

  Examples:
    ${pc.dim('npx create-nextsheet-app')}
    ${pc.dim('npx create-nextsheet-app my-workbook')}
    ${pc.dim('npx create-nextsheet-app my-workbook --yes')}
  `)
  process.exit(0)
}

const opts = await gatherOptions(argv)
const dir  = await createProject(opts)
const rel  = relative(process.cwd(), dir) || opts.name

const ext     = opts.useTypeScript ? 'tsx' : 'jsx'
const pm      = opts.packageManager
const runDev  = pm === 'npm' ? 'npm run dev' : `${pm} dev`
const runBuild= pm === 'npm' ? 'npm run build' : `${pm} build`

const nextSteps: string[] = []

if (!opts.install) {
  const installCmd =
    pm === 'yarn' ? 'yarn' :
    pm === 'bun'  ? 'bun install' :
    `${pm} install`
  nextSteps.push(`${pc.dim('1.')} cd ${rel} && ${installCmd}`)
  nextSteps.push(`${pc.dim('2.')} ${runDev}`)
} else {
  nextSteps.push(`${pc.dim('1.')} cd ${rel}`)
  nextSteps.push(`${pc.dim('2.')} ${runDev}`)
}

if (opts.backend !== 'none') {
  nextSteps.push(`${pc.dim('3.')} Fill in credentials in ${pc.cyan('.env.local')}`)
}

note(nextSteps.join('\n'), 'Next steps')

outro(
  `${pc.green('✓')} ${pc.bold(opts.name)} is ready. ` +
  `Edit ${pc.cyan(`${rel}/sheets/Sales.sheet.${ext}`)} to get started.`
)
