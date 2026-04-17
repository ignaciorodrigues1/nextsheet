import type { Command } from 'commander'
import { log } from '../logger.js'
import { loadWorkbook } from '../loader.js'
import { superSheetAdapter } from 'nextsheet'
import type { NextSheetOutput } from 'nextsheet'

/**
 * Deploy to SuperSheet via Supabase REST API directly.
 *
 * Required env vars (or CLI flags):
 *   SUPABASE_URL         — your project URL, e.g. https://xxxx.supabase.co
 *   SUPABASE_ANON_KEY    — public anon key (safe to commit)
 *   SUPABASE_JWT         — user session JWT (from browser localStorage:
 *                          JSON.parse(localStorage.getItem(
 *                            'sb-<ref>-auth-token'
 *                          )).access_token)
 */
async function deployToSupabase(
  output: NextSheetOutput,
  opts: { supabaseUrl: string; anonKey: string; jwt: string; workbookId?: string }
): Promise<{ id: string }> {
  const base = opts.supabaseUrl.replace(/\/$/, '')
  const headers = {
    'Content-Type': 'application/json',
    'apikey': opts.anonKey,
    'Authorization': `Bearer ${opts.jwt}`,
    'Prefer': 'return=minimal',
  }

  if (opts.workbookId) {
    const res = await fetch(
      `${base}/rest/v1/workbooks?id=eq.${opts.workbookId}`,
      {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ title: output.name, data: output.workbookData }),
      }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string }
      throw new Error(err.message ?? `HTTP ${res.status}`)
    }
    return { id: opts.workbookId }
  }

  // Create new workbook — user_id comes from JWT (enforced by Supabase RLS)
  const res = await fetch(`${base}/rest/v1/workbooks`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify({ title: output.name, data: output.workbookData }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }
  const rows = await res.json() as Array<{ id: string }>
  const first = rows[0]
  if (first === undefined) throw new Error('Supabase returned no rows after insert')
  return { id: first.id }
}

export function deployCommand(program: Command): void {
  program
    .command('deploy <files...>')
    .description('Deploy sheets to SuperSheet (or other remote targets).')
    .option('-t, --target <target>', 'deploy target: supersheet | google | excel-online', 'supersheet')
    .option('-n, --name <name>', 'workbook name', 'Workbook')
    // SuperSheet / Supabase options
    .option('--supabase-url <url>',   'Supabase project URL (or SUPABASE_URL env)')
    .option('--anon-key <key>',       'Supabase anon key (or SUPABASE_ANON_KEY env)')
    .option('--jwt <token>',          'Supabase user JWT (or SUPABASE_JWT env)')
    .option('--workbook-id <id>',     'update an existing workbook instead of creating one')
    // Legacy / future
    .option('--id <id>',              'spreadsheet ID (Google Sheets)')
    .action(async (
      files: string[],
      opts: {
        target: string
        name: string
        supabaseUrl?: string
        anonKey?: string
        jwt?: string
        workbookId?: string
      }
    ) => {
      if (opts.target === 'google' || opts.target === 'excel-online') {
        log.warn(`deploy --target ${opts.target} is planned for NextSheet v0.3.`)
        process.exit(0)
      }

      if (opts.target !== 'supersheet') {
        log.error(`Unknown target: ${opts.target}. Valid: supersheet | google | excel-online`)
        process.exit(1)
      }

      const supabaseUrl = opts.supabaseUrl ?? process.env['SUPABASE_URL']
      const anonKey     = opts.anonKey     ?? process.env['SUPABASE_ANON_KEY']
      const jwt         = opts.jwt         ?? process.env['SUPABASE_JWT']

      if (!supabaseUrl || !anonKey || !jwt) {
        log.error(
          'Missing credentials. Set via flags or environment variables:\n\n' +
          '  SUPABASE_URL      — e.g. https://xxxx.supabase.co\n' +
          '  SUPABASE_ANON_KEY — public anon key\n' +
          '  SUPABASE_JWT      — your session token. Get it from the browser console:\n' +
          '                      JSON.parse(localStorage.getItem(\n' +
          "                        Object.keys(localStorage).find(k => k.endsWith('-auth-token'))\n" +
          '                      )).access_token\n\n' +
          '  Or run: nextsheet build --target supersheet\n' +
          '  and import the generated nextsheet.output.json via SuperSheet → Add New → NextSheet Project'
        )
        process.exit(1)
      }

      log.info(`Building ${files.length} sheet(s) for SuperSheet…`)

      try {
        const wb = await loadWorkbook(files, opts.name)
        const result = await superSheetAdapter.render(wb)
        const output = JSON.parse(result.data as string) as NextSheetOutput

        log.info('Deploying to SuperSheet…')

        const { id } = await deployToSupabase(output, {
          supabaseUrl,
          anonKey,
          jwt,
          workbookId: opts.workbookId,
        })

        log.success(`Deployed → workbook ID: ${id}`)
        log.dim(`  Open: ${supabaseUrl.replace('.supabase.co', '.app')}/workbook/${id}`)
      } catch (err) {
        log.error(err instanceof Error ? err.message : String(err))
        process.exit(1)
      }
    })
}
