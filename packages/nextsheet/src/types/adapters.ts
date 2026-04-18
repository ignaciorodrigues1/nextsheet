// ─── Adapter and build types ───────────────────────────────────────────────────

import type { WorkbookNode } from './nodes.js'

export interface RenderResult {
  readonly mimeType: string
  readonly extension: string
  readonly data: Buffer | string
}

export interface Adapter {
  readonly name: string
  render(workbook: WorkbookNode): Promise<RenderResult>
}

export type BuildTarget = 'csv' | 'xlsx' | 'html' | 'google' | 'excel-online' | 'supersheet'

export interface BuildOptions {
  readonly target: BuildTarget
  readonly out?: string
  readonly data?: Record<string, unknown[]>
}
