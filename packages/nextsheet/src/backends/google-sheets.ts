import { createSign } from 'node:crypto'
import type { Backend } from './types.js'

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export interface ServiceAccountKey {
  client_email: string
  private_key: string
}

function parseKey(input: ServiceAccountKey | string): ServiceAccountKey {
  return typeof input === 'string' ? (JSON.parse(input) as ServiceAccountKey) : input
}

function mintJwt(key: ServiceAccountKey): string {
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url')
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${payload}`)
  return `${header}.${payload}.${signer.sign(key.private_key, 'base64url')}`
}

async function exchangeJwt(jwt: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  if (!res.ok) throw new Error(`[nextsheet] Google OAuth2 token exchange failed: ${res.status}`)
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

// ─── Row conversion ───────────────────────────────────────────────────────────

function matrixToRows<T>(values: unknown[][]): T[] {
  if (values.length < 2) return []
  const headers = values[0] as string[]
  return values.slice(1).map(
    (row) => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? null])) as T
  )
}

// ─── Backend ──────────────────────────────────────────────────────────────────

export interface GoogleSheetsBackendOptions {
  /** Spreadsheet ID from the URL: /spreadsheets/d/{id}/edit */
  spreadsheetId: string
  /** Service account key JSON string or object. Takes priority over apiKey. */
  credentials?: ServiceAccountKey | string
  /** Google API key — read-only, public sheets only. */
  apiKey?: string
  /** Pre-obtained OAuth2 access token. */
  accessToken?: string
}

export class GoogleSheetsBackend implements Backend {
  readonly name = 'google-sheets'
  private readonly opts: GoogleSheetsBackendOptions
  private _cachedToken?: string

  constructor(opts: GoogleSheetsBackendOptions) {
    this.opts = opts
  }

  /** Resolve an access token for API calls (cached per instance). */
  async getAccessToken(): Promise<string | null> {
    if (this.opts.accessToken) return this.opts.accessToken
    if (!this.opts.credentials) return null
    if (!this._cachedToken) {
      this._cachedToken = await exchangeJwt(mintJwt(parseKey(this.opts.credentials)))
    }
    return this._cachedToken
  }

  async fetchRange<T = Record<string, unknown>>(address: string): Promise<T[]> {
    const { spreadsheetId, apiKey } = this.opts
    if (!spreadsheetId) return []
    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(address)}`
    )
    const headers: Record<string, string> = {}
    const token = await this.getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else if (apiKey) {
      url.searchParams.set('key', apiKey)
    } else {
      throw new Error(
        '[nextsheet] GoogleSheetsBackend requires credentials, accessToken, or apiKey'
      )
    }
    const res = await fetch(url, { headers })
    if (!res.ok) {
      throw new Error(
        `[nextsheet] Google Sheets fetchRange(${address}) failed: ${res.status} ${await res.text()}`
      )
    }
    const data = (await res.json()) as { values?: unknown[][] }
    return matrixToRows<T>(data.values ?? [])
  }
}

export function googleSheetsBackend(opts: GoogleSheetsBackendOptions): GoogleSheetsBackend {
  return new GoogleSheetsBackend(opts)
}
