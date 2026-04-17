import { Command } from 'commander'
import { buildCommand } from './commands/build.js'
import { deployCommand } from './commands/deploy.js'
import { devCommand } from './commands/dev.js'

const program = new Command()

program
  .name('nextsheet')
  .description('The framework for the spreadsheet era.')
  .version('0.1.0')

buildCommand(program)
devCommand(program)
deployCommand(program)

program.parse(process.argv)
