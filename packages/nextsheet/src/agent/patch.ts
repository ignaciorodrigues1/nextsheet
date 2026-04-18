import type { CellColor, ColumnType } from '../types/index.js'

// ─── Patch operation types ────────────────────────────────────────────────────
// All patch operations are immutable value objects. Apply them with applyPatch().

export interface AddRowPatch {
  readonly op: 'addRow'
  readonly sheet: string
  /** Column name → cell value. Unspecified columns receive their default or null. */
  readonly values: Record<string, string | number | boolean | null>
  /** Insert before this row index (0-based). Omit to append. */
  readonly at?: number
}

export interface UpdateCellPatch {
  readonly op: 'updateCell'
  readonly sheet: string
  readonly rowIndex: number
  readonly column: string
  readonly value: string | number | boolean | null
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

export interface RenameSheetPatch {
  readonly op: 'renameSheet'
  readonly sheet: string
  readonly newName: string
}

export type PatchOperation =
  | AddRowPatch
  | UpdateCellPatch
  | RemoveRowPatch
  | AddColumnPatch
  | RemoveColumnPatch
  | SetHeaderPatch
  | AddSheetPatch
  | RenameSheetPatch
