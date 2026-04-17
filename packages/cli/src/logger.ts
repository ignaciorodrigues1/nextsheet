import pc from 'picocolors'

const prefix = pc.bold(pc.cyan('nextsheet'))

export const log = {
  info: (msg: string) => console.log(`${prefix} ${msg}`),
  success: (msg: string) => console.log(`${prefix} ${pc.green('✓')} ${msg}`),
  warn: (msg: string) => console.warn(`${prefix} ${pc.yellow('⚠')} ${msg}`),
  error: (msg: string) => console.error(`${prefix} ${pc.red('✗')} ${msg}`),
  dim: (msg: string) => console.log(pc.dim(msg)),
}
