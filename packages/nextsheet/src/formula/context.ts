// Global state for formula transpilation — uses globalThis so it's shared across
// module instances (the CLI imports nextsheet directly; transpiled sheet files bundle
// it inline). Both copies read/write the same globalThis key.

import type { ColumnNode } from '../types/index.js'

interface FormulaCtx {
  active: boolean
  colMap: Record<string, string>
}

function ctx(): FormulaCtx {
  const g = globalThis as Record<string, unknown>
  if (g['__nxt_formula_ctx'] === undefined) {
    g['__nxt_formula_ctx'] = { active: false, colMap: {} } satisfies FormulaCtx
  }
  return g['__nxt_formula_ctx'] as FormulaCtx
}

function columnLetter(index: number): string {
  let letter = ''
  let n = index + 1
  while (n > 0) {
    const rem = (n - 1) % 26
    letter = String.fromCharCode(65 + rem) + letter
    n = Math.floor((n - 1) / 26)
  }
  return letter
}

/** Activate formula transpilation mode. Call before re-rendering a sheet. */
export function enterFormulaMode(columns: ColumnNode[]): void {
  const c = ctx()
  c.active = true
  c.colMap = {}
  columns.forEach((col, i) => {
    c.colMap[col.name] = columnLetter(i)
  })
}

/** Deactivate formula transpilation mode. */
export function exitFormulaMode(): void {
  const c = ctx()
  c.active = false
  c.colMap = {}
}

export function isFormulaMode(): boolean {
  return ctx().active
}

/** Returns the whole-column address for a named column (e.g. "B:B"). */
export function columnAddress(name: string): string {
  const letter = ctx().colMap[name]
  return letter !== undefined ? `${letter}:${letter}` : name
}
