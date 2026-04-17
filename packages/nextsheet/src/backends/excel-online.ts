import type { Backend } from './types.js'

// ─── Row conversion ───────────────────────────────────────────────────────────

function matrixToRows<T>(values: unknown[][]): T[] {
  if (values.length < 2) return []
  const headers = values[0] as string[]
  return values.slice(1).map(
    (row) => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? null])) as T
  )
}

/** Split "Sheet1!A1:C10" → { sheet: "Sheet1", range: "A1:C10" } */
function parseAddress(address: string): { sheet: string; range: string } {
  const sep = address.indexOf('!')
  if (sep === -1) return { sheet: 'Sheet1', range: address }
  return { sheet: address.slice(0, sep), range: address.slice(sep + 1) }
}

// ─── Backend ──────────────────────────────────────────────────────────────────

export interface ExcelOnlineBackendOptions {
  /** OneDrive drive item ID of the .xlsx file. */
  driveItemId: string
  /** Microsoft Graph API OAuth2 access token. */
  accessToken: string
}

export class ExcelOnlineBackend implements Backend {
  readonly name = 'excel-online'
  private readonly opts: ExcelOnlineBackendOptions

  constructor(opts: ExcelOnlineBackendOptions) {
    this.opts = opts
  }

  async fetchRange<T = Record<string, unknown>>(address: string): Promise<T[]> {
    const { driveItemId, accessToken } = this.opts
    const { sheet, range } = parseAddress(address)
    const url = [
      'https://graph.microsoft.com/v1.0/me/drive/items',
      driveItemId,
      'workbook/worksheets',
      encodeURIComponent(sheet),
      `range(address='${encodeURIComponent(range)}')`,
    ].join('/')
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) {
      throw new Error(
        `[nextsheet] Excel Online fetchRange(${address}) failed: ${res.status} ${await res.text()}`
      )
    }
    const data = (await res.json()) as { values?: unknown[][] }
    return matrixToRows<T>(data.values ?? [])
  }
}

export function excelOnlineBackend(opts: ExcelOnlineBackendOptions): ExcelOnlineBackend {
  return new ExcelOnlineBackend(opts)
}
