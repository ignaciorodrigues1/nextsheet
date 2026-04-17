import { GoogleSheetsBackend, ExcelOnlineBackend } from 'nextsheet/backends'
import type { Backend } from 'nextsheet/backends'

export interface BackendCliOpts {
  googleSpreadsheetId?: string
  googleAccessToken?: string
  googleCredentials?: string
  microsoftToken?: string
  driveItemId?: string
}

/**
 * Build a live backend from CLI flags / env vars, or return undefined
 * if no backend credentials are present (falls back to static empty data).
 *
 * Priority: Google Sheets > Excel Online.
 * Google requires a spreadsheet ID + at least one auth method.
 * Excel requires an access token + a drive item ID.
 */
export function resolveBackend(opts: BackendCliOpts): Backend | undefined {
  const spreadsheetId =
    opts.googleSpreadsheetId ?? process.env['GOOGLE_SPREADSHEET_ID']
  const googleToken =
    opts.googleAccessToken ?? process.env['GOOGLE_ACCESS_TOKEN']
  const credentials =
    opts.googleCredentials ?? process.env['GOOGLE_SERVICE_ACCOUNT_KEY']

  if (spreadsheetId && (googleToken ?? credentials)) {
    return new GoogleSheetsBackend({ spreadsheetId, accessToken: googleToken, credentials })
  }

  const msToken = opts.microsoftToken ?? process.env['MICROSOFT_ACCESS_TOKEN']
  const driveItemId = opts.driveItemId ?? process.env['EXCEL_DRIVE_ITEM_ID']

  if (msToken && driveItemId) {
    return new ExcelOnlineBackend({ accessToken: msToken, driveItemId })
  }

  return undefined
}

/** Shared backend option definitions for commander .option() calls. */
export const backendOptions = [
  ['--google-spreadsheet-id <id>',     'Google Sheets ID for useRange() data (or GOOGLE_SPREADSHEET_ID env)'],
  ['--google-access-token <token>',    'Google OAuth2 access token (or GOOGLE_ACCESS_TOKEN env)'],
  ['--google-credentials <json>',      'Service account key JSON (or GOOGLE_SERVICE_ACCOUNT_KEY env)'],
  ['--microsoft-token <token>',        'Microsoft Graph access token (or MICROSOFT_ACCESS_TOKEN env)'],
  ['--drive-item-id <id>',             'OneDrive item ID for useRange() data (or EXCEL_DRIVE_ITEM_ID env)'],
] as const
