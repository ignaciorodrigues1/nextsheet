import type { Command } from 'commander'
import { log } from '../logger.js'
import { loadWorkbook } from '../loader.js'
import { superSheetAdapter } from 'nextsheet'
import type { NextSheetOutput } from 'nextsheet'
import { loadEnv } from '../env.js'
import { GoogleSheetsBackend } from 'nextsheet/backends'
import { deployToGoogleSheets } from '../deploy/google-sheets.js'
import { deployToExcelOnline } from '../deploy/excel-online.js'
import { ExcelOnlineBackend } from 'nextsheet/backends'

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
    .description('Deploy sheets to SuperSheet, Google Sheets, or Excel Online.')
    .option('-t, --target <target>', 'deploy target: supersheet | google | excel-online', 'supersheet')
    .option('-n, --name <name>', 'workbook name', 'Workbook')
    // SuperSheet / Supabase options
    .option('--supabase-url <url>',   'Supabase project URL (or SUPABASE_URL env)')
    .option('--anon-key <key>',       'Supabase anon key (or SUPABASE_ANON_KEY env)')
    .option('--jwt <token>',          'Supabase user JWT (or SUPABASE_JWT env)')
    .option('--workbook-id <id>',     'update an existing SuperSheet workbook instead of creating one')
    // Google Sheets options
    .option('--spreadsheet-id <id>',  'Google Sheets ID to update (creates new if omitted; or GOOGLE_SPREADSHEET_ID env)')
    .option('--google-access-token <token>', 'Google OAuth2 access token (or GOOGLE_ACCESS_TOKEN env)')
    .option('--google-credentials <json>',   'Service account key JSON string (or GOOGLE_SERVICE_ACCOUNT_KEY env)')
    // Excel Online options
    .option('--drive-item-id <id>',   'OneDrive item ID of .xlsx file (creates new if omitted; or EXCEL_DRIVE_ITEM_ID env)')
    .option('--microsoft-token <token>', 'Microsoft Graph access token (or MICROSOFT_ACCESS_TOKEN env)')
    .option('--excel-file-name <name>',  'file name when creating a new Excel workbook (defaults to workbook name)')
    .action(async (
      files: string[],
      opts: {
        target: string
        name: string
        // supersheet
        supabaseUrl?: string
        anonKey?: string
        jwt?: string
        workbookId?: string
        // google
        spreadsheetId?: string
        googleAccessToken?: string
        googleCredentials?: string
        // excel
        driveItemId?: string
        microsoftToken?: string
        excelFileName?: string
      }
    ) => {
      loadEnv('production')

      // ── Google Sheets ──────────────────────────────────────────────────────
      if (opts.target === 'google') {
        const accessToken =
          opts.googleAccessToken ?? process.env['GOOGLE_ACCESS_TOKEN']
        const credentialsJson =
          opts.googleCredentials ?? process.env['GOOGLE_SERVICE_ACCOUNT_KEY']
        const spreadsheetId =
          opts.spreadsheetId ?? process.env['GOOGLE_SPREADSHEET_ID']

        if (!accessToken && !credentialsJson) {
          log.error(
            'Missing Google credentials. Provide one of:\n\n' +
            '  --google-access-token <token>   OAuth2 access token\n' +
            '  --google-credentials <json>     Service account key JSON\n' +
            '  GOOGLE_ACCESS_TOKEN             env var\n' +
            '  GOOGLE_SERVICE_ACCOUNT_KEY      env var (service account JSON)\n\n' +
            'Optional:\n' +
            '  --spreadsheet-id <id>           Update existing sheet (creates new if omitted)\n' +
            '  GOOGLE_SPREADSHEET_ID           env var'
          )
          process.exit(1)
        }

        const backend = new GoogleSheetsBackend({
          // spreadsheetId is required for useRange; if not provided, useRange returns []
          spreadsheetId: spreadsheetId ?? '',
          accessToken,
          credentials: credentialsJson,
        })

        log.info(`Building ${files.length} sheet(s) for Google Sheets…`)
        try {
          const wb = await loadWorkbook(files, opts.name, backend)
          const token = await backend.getAccessToken()
          if (!token) throw new Error('Could not obtain Google access token')

          log.info('Deploying to Google Sheets…')
          const { spreadsheetId: finalId, url } = await deployToGoogleSheets(wb, {
            token,
            spreadsheetId,
            name: opts.name,
          })

          log.success(`Deployed → spreadsheet ID: ${finalId}`)
          log.dim(`  Open: ${url}`)
        } catch (err) {
          log.error(err instanceof Error ? err.message : String(err))
          process.exit(1)
        }
        return
      }

      // ── Excel Online ───────────────────────────────────────────────────────
      if (opts.target === 'excel-online') {
        const accessToken =
          opts.microsoftToken ?? process.env['MICROSOFT_ACCESS_TOKEN']
        const driveItemId =
          opts.driveItemId ?? process.env['EXCEL_DRIVE_ITEM_ID']

        if (!accessToken) {
          log.error(
            'Missing Microsoft Graph access token. Provide one of:\n\n' +
            '  --microsoft-token <token>   OAuth2 access token\n' +
            '  MICROSOFT_ACCESS_TOKEN      env var\n\n' +
            'Optional:\n' +
            '  --drive-item-id <id>        Update existing file (creates new if omitted)\n' +
            '  EXCEL_DRIVE_ITEM_ID         env var\n' +
            '  --excel-file-name <name>    File name when creating (defaults to workbook name)'
          )
          process.exit(1)
        }

        const backend = driveItemId
          ? new ExcelOnlineBackend({ driveItemId, accessToken })
          : undefined

        log.info(`Building ${files.length} sheet(s) for Excel Online…`)
        try {
          const wb = await loadWorkbook(files, opts.name, backend)

          log.info('Deploying to Excel Online…')
          const { driveItemId: finalId, url } = await deployToExcelOnline(wb, {
            accessToken,
            driveItemId,
            fileName: opts.excelFileName,
          })

          log.success(`Deployed → drive item ID: ${finalId}`)
          log.dim(`  Open: ${url}`)
        } catch (err) {
          log.error(err instanceof Error ? err.message : String(err))
          process.exit(1)
        }
        return
      }

      // ── SuperSheet ────────────────────────────────────────────────────────
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
