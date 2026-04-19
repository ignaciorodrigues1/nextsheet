import type { CellColor, ColumnType, ChartNode } from '../types/index.js'

// ─── Patch operation types ────────────────────────────────────────────────────
// All patch operations are immutable value objects. Apply them with applyPatch().
// On invalid input, applyPatch() throws AgentError with a typed code field.

export interface AddRowPatch {
  readonly op: 'addRow'
  readonly sheet: string
  /** Column name → cell value. Unspecified columns receive null. */
  readonly values: Record<string, string | number | boolean | null>
  /** Insert before this row index (0-based). Omit to append. */
  readonly at?: number
}

export interface UpdateCellPatch {
  readonly op: 'updateCell'
  readonly sheet: string
  readonly rowIndex: number
  readonly column: string
  /** New cell value. Omit to leave unchanged (use alongside formula or format). */
  readonly value?: string | number | boolean | null
  /** Spreadsheet formula. Sets or replaces the cell formula. */
  readonly formula?: string
  /** Number/date format string, e.g. "#,##0.00" or "YYYY-MM-DD". */
  readonly format?: string
  readonly color?: CellColor
  readonly bold?: boolean
}

export interface RemoveRowPatch {
  readonly op: 'removeRow'
  readonly sheet: string
  readonly rowIndex: number
}

export interface AddColumnPatch {
  readonly op: 'addColumn'
  readonly sheet: string
  readonly name: string
  readonly type: ColumnType
  readonly required?: boolean
  readonly primary?: boolean
  readonly options?: readonly string[]
  readonly currency?: string
  readonly formula?: string
  /** Insert before this column index (0-based). Omit to append. */
  readonly at?: number
}

export interface RemoveColumnPatch {
  readonly op: 'removeColumn'
  readonly sheet: string
  readonly column: string
}

export interface SetHeaderPatch {
  readonly op: 'setHeader'
  readonly sheet: string
  readonly title: string
  readonly subtitle?: string
}

export interface AddSheetPatch {
  readonly op: 'addSheet'
  readonly name: string
}

export interface RemoveSheetPatch {
  readonly op: 'removeSheet'
  readonly sheet: string
}

export interface RenameSheetPatch {
  readonly op: 'renameSheet'
  readonly sheet: string
  readonly newName: string
}

export interface UpdateColumnPatch {
  readonly op: 'updateColumn'
  readonly sheet: string
  /** Current column name. */
  readonly column: string
  readonly updates: {
    readonly name?: string
    readonly type?: ColumnType
    readonly primary?: boolean
    readonly required?: boolean
    readonly options?: readonly string[]
    readonly currency?: string
    readonly formula?: string
    readonly format?: string
  }
}

export interface AddChartPatch {
  readonly op: 'addChart'
  readonly sheet: string
  readonly chart: Omit<ChartNode, 'kind'>
}

export type PatchOperation =
  | AddRowPatch
  | UpdateCellPatch
  | RemoveRowPatch
  | AddColumnPatch
  | RemoveColumnPatch
  | SetHeaderPatch
  | AddSheetPatch
  | RemoveSheetPatch
  | RenameSheetPatch
  | UpdateColumnPatch
  | AddChartPatch
