import type {
  CellColor,
  CellNode,
  ChartNode,
  ColumnNode,
  ColumnType,
  HeaderNode,
  PaginateNode,
  RowNode,
  SectionNode,
  SheetNode,
  WorkbookNode,
} from '../types/index.js'
import type { PatchOperation } from './patch.js'

// ─── Typed error ──────────────────────────────────────────────────────────────

/**
 * Error codes thrown by WorkbookBuilder.applyPatch().
 *
 * | Code                  | Trigger                                              |
 * |-----------------------|------------------------------------------------------|
 * | SHEET_NOT_FOUND       | `sheet` references a name that doesn't exist         |
 * | SHEET_ALREADY_EXISTS  | `addSheet` / `renameSheet` targets an existing name  |
 * | COLUMN_NOT_FOUND      | `column` references a name not in the sheet          |
 * | COLUMN_ALREADY_EXISTS | `addColumn` uses a name already present              |
 * | ROW_OUT_OF_BOUNDS     | `rowIndex` is negative or ≥ rows.length              |
 * | EMPTY_UPDATE          | `updateColumn` `updates` object has no fields        |
 */
export type AgentErrorCode =
  | 'SHEET_NOT_FOUND'
  | 'SHEET_ALREADY_EXISTS'
  | 'COLUMN_NOT_FOUND'
  | 'COLUMN_ALREADY_EXISTS'
  | 'ROW_OUT_OF_BOUNDS'
  | 'EMPTY_UPDATE'

/** Structured error thrown by applyPatch() on invalid operations. */
export class AgentError extends Error {
  /** Machine-readable error code. Safe to switch on. */
  readonly code: AgentErrorCode
  /** The `op` string of the patch that triggered this error. */
  readonly op: string

  constructor(code: AgentErrorCode, op: string, message: string) {
    super(`[${code}] ${op}: ${message}`)
    this.name = 'AgentError'
    this.code = code
    this.op = op
  }
}

// ─── Cell builder ─────────────────────────────────────────────────────────────

export class CellBuilder {
  private _value: string | number | boolean | null = null
  private _formula?: string
  private _format?: string
  private _color?: CellColor
  private _bold?: boolean
  private _colspan?: number

  value(v: string | number | boolean | null): this { this._value = v; return this }
  formula(f: string): this { this._formula = f; return this }
  format(f: string): this { this._format = f; return this }
  color(c: CellColor): this { this._color = c; return this }
  bold(b = true): this { this._bold = b; return this }
  span(n: number): this { this._colspan = n; return this }

  build(): CellNode {
    return {
      kind: 'cell',
      value: this._value ?? undefined,
      ...(this._formula !== undefined && { formula: this._formula }),
      ...(this._format  !== undefined && { format:  this._format  }),
      ...(this._color   !== undefined && { color:   this._color   }),
      ...(this._bold    !== undefined && { bold:    this._bold    }),
      ...(this._colspan !== undefined && { colspan: this._colspan }),
    }
  }
}

// ─── Row builder ──────────────────────────────────────────────────────────────

export class RowBuilder {
  private _cells: CellNode[] = []
  private _header = false

  header(b = true): this { this._header = b; return this }

  cell(value: string | number | boolean | null, opts?: { color?: CellColor; bold?: boolean; format?: string }): this {
    this._cells.push({
      kind: 'cell',
      value,
      ...(opts?.color  !== undefined && { color:  opts.color  }),
      ...(opts?.bold   !== undefined && { bold:   opts.bold   }),
      ...(opts?.format !== undefined && { format: opts.format }),
    })
    return this
  }

  addCell(cell: CellNode): this { this._cells.push(cell); return this }

  build(): RowNode {
    return { kind: 'row', header: this._header || undefined, cells: this._cells }
  }
}

// ─── Section builder ──────────────────────────────────────────────────────────

export class SectionBuilder {
  private _title?: string
  private _rows: RowNode[] = []

  title(t: string): this { this._title = t; return this }

  row(values: (string | number | boolean | null)[]): this {
    this._rows.push({ kind: 'row', cells: values.map((v) => ({ kind: 'cell', value: v })) })
    return this
  }

  addRow(row: RowNode): this { this._rows.push(row); return this }

  build(): SectionNode {
    return { kind: 'section', title: this._title, rows: this._rows }
  }
}

// ─── Sheet builder ────────────────────────────────────────────────────────────

export class SheetBuilder {
  private _name: string
  private _columns: ColumnNode[] = []
  private _sections: SectionNode[] = []
  private _rows: RowNode[] = []
  private _charts: ChartNode[] = []
  private _header?: HeaderNode
  private _pagination?: PaginateNode

  constructor(name: string) { this._name = name }

  header(title: string, subtitle?: string): this {
    this._header = { kind: 'header', title, ...(subtitle !== undefined && { subtitle }) }
    return this
  }

  column(name: string, type: ColumnType, opts?: {
    primary?: boolean
    required?: boolean
    options?: readonly string[]
    currency?: string
    formula?: string
    format?: string
  }): this {
    this._columns.push({
      kind: 'column',
      name,
      type,
      ...(opts?.primary  !== undefined && { primary:  opts.primary  }),
      ...(opts?.required !== undefined && { required: opts.required }),
      ...(opts?.options  !== undefined && { options:  opts.options  }),
      ...(opts?.currency !== undefined && { currency: opts.currency }),
      ...(opts?.formula  !== undefined && { formula:  opts.formula  }),
      ...(opts?.format   !== undefined && { format:   opts.format   }),
    })
    return this
  }

  paginate(pageSize: number, initialPage = 1): this {
    this._pagination = { kind: 'paginate', pageSize, initialPage }
    return this
  }

  section(title: string, rows: (string | number | boolean | null)[][]): this {
    this._sections.push({
      kind: 'section',
      title,
      rows: rows.map((cells) => ({
        kind: 'row',
        cells: cells.map((v) => ({ kind: 'cell', value: v })),
      })),
    })
    return this
  }

  addSection(s: SectionNode): this { this._sections.push(s); return this }

  row(values: (string | number | boolean | null)[]): this {
    this._rows.push({
      kind: 'row',
      cells: values.map((v) => ({ kind: 'cell', value: v })),
    })
    return this
  }

  addRow(r: RowNode): this { this._rows.push(r); return this }

  chart(chart: Omit<ChartNode, 'kind'>): this {
    this._charts.push({ kind: 'chart', ...chart })
    return this
  }

  build(): SheetNode {
    return {
      kind: 'sheet',
      name: this._name,
      columns: this._columns,
      sections: this._sections,
      rows: this._rows,
      charts: this._charts,
      ...(this._header     !== undefined && { header:     this._header     }),
      ...(this._pagination !== undefined && { pagination: this._pagination }),
    }
  }
}

// ─── Workbook builder ─────────────────────────────────────────────────────────

export class WorkbookBuilder {
  private _name: string
  private _sheets: SheetNode[]

  constructor(name: string, sheets: SheetNode[] = []) {
    this._name = name
    this._sheets = sheets
  }

  sheet(name: string, configure: (s: SheetBuilder) => void): this {
    const b = new SheetBuilder(name)
    configure(b)
    this._sheets.push(b.build())
    return this
  }

  addSheet(sheet: SheetNode): this { this._sheets.push(sheet); return this }

  /**
   * Apply a sequence of patch operations to the workbook in memory.
   * @throws {AgentError} on invalid input — check `e.code` for the reason.
   */
  applyPatch(...ops: PatchOperation[]): this {
    for (const op of ops) this._applyOne(op)
    return this
  }

  build(): WorkbookNode {
    return { kind: 'workbook', name: this._name, sheets: this._sheets }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private _findSheet(name: string, opName: string): SheetNode {
    const s = this._sheets.find((s) => s.name === name)
    if (!s) throw new AgentError('SHEET_NOT_FOUND', opName, `sheet "${name}" does not exist`)
    return s
  }

  private _findColumn(sheet: SheetNode, colName: string, opName: string): number {
    const idx = sheet.columns.findIndex((c) => c.name === colName)
    if (idx === -1) throw new AgentError('COLUMN_NOT_FOUND', opName, `column "${colName}" not found in sheet "${sheet.name}"`)
    return idx
  }

  private _assertRowInBounds(sheet: SheetNode, rowIndex: number, opName: string): void {
    if (rowIndex < 0 || rowIndex >= sheet.rows.length) {
      throw new AgentError('ROW_OUT_OF_BOUNDS', opName, `rowIndex ${rowIndex} is out of bounds (sheet "${sheet.name}" has ${sheet.rows.length} rows)`)
    }
  }

  private _mutateSheet(name: string, fn: (s: SheetNode) => SheetNode): void {
    this._sheets = this._sheets.map((s) => s.name === name ? fn(s) : s)
  }

  // ─── Patch dispatcher ────────────────────────────────────────────────────

  private _applyOne(op: PatchOperation): void {
    switch (op.op) {

      case 'addSheet': {
        if (this._sheets.some((s) => s.name === op.name)) {
          throw new AgentError('SHEET_ALREADY_EXISTS', 'addSheet', `sheet "${op.name}" already exists`)
        }
        this._sheets.push({ kind: 'sheet', name: op.name, columns: [], sections: [], rows: [], charts: [] })
        break
      }

      case 'removeSheet': {
        this._findSheet(op.sheet, 'removeSheet')
        this._sheets = this._sheets.filter((s) => s.name !== op.sheet)
        break
      }

      case 'renameSheet': {
        this._findSheet(op.sheet, 'renameSheet')
        if (this._sheets.some((s) => s.name === op.newName)) {
          throw new AgentError('SHEET_ALREADY_EXISTS', 'renameSheet', `a sheet named "${op.newName}" already exists`)
        }
        this._mutateSheet(op.sheet, (s) => ({ ...s, name: op.newName }))
        break
      }

      case 'setHeader': {
        this._findSheet(op.sheet, 'setHeader')
        this._mutateSheet(op.sheet, (s) => ({
          ...s,
          header: { kind: 'header', title: op.title, ...(op.subtitle !== undefined && { subtitle: op.subtitle }) },
        }))
        break
      }

      case 'addColumn': {
        const sheet = this._findSheet(op.sheet, 'addColumn')
        if (sheet.columns.some((c) => c.name === op.name)) {
          throw new AgentError('COLUMN_ALREADY_EXISTS', 'addColumn', `column "${op.name}" already exists in sheet "${op.sheet}"`)
        }
        const newCol: ColumnNode = {
          kind: 'column', name: op.name, type: op.type,
          ...(op.primary  !== undefined && { primary:  op.primary  }),
          ...(op.required !== undefined && { required: op.required }),
          ...(op.options  !== undefined && { options:  op.options  }),
          ...(op.currency !== undefined && { currency: op.currency }),
          ...(op.formula  !== undefined && { formula:  op.formula  }),
        }
        this._mutateSheet(op.sheet, (s) => {
          const cols = [...s.columns]
          if (op.at !== undefined) cols.splice(op.at, 0, newCol)
          else cols.push(newCol)
          const colIdx = op.at !== undefined ? op.at : cols.length - 1
          const rows = s.rows.map((r) => {
            const cells = [...r.cells]
            cells.splice(colIdx, 0, { kind: 'cell', value: null })
            return { ...r, cells }
          })
          return { ...s, columns: cols, rows }
        })
        break
      }

      case 'removeColumn': {
        const sheet = this._findSheet(op.sheet, 'removeColumn')
        const colIdx = this._findColumn(sheet, op.column, 'removeColumn')
        this._mutateSheet(op.sheet, (s) => ({
          ...s,
          columns: s.columns.filter((c) => c.name !== op.column),
          rows: s.rows.map((r) => ({
            ...r,
            cells: r.cells.filter((_, i) => i !== colIdx),
          })),
        }))
        break
      }

      case 'updateColumn': {
        const sheet = this._findSheet(op.sheet, 'updateColumn')
        this._findColumn(sheet, op.column, 'updateColumn')
        const { updates } = op
        if (Object.keys(updates).length === 0) {
          throw new AgentError('EMPTY_UPDATE', 'updateColumn', `updates object is empty for column "${op.column}"`)
        }
        // If renaming, check the new name doesn't already exist (unless same name)
        if (updates.name !== undefined && updates.name !== op.column) {
          if (sheet.columns.some((c) => c.name === updates.name)) {
            throw new AgentError('COLUMN_ALREADY_EXISTS', 'updateColumn', `column "${updates.name}" already exists in sheet "${op.sheet}"`)
          }
        }
        this._mutateSheet(op.sheet, (s) => ({
          ...s,
          columns: s.columns.map((c) => {
            if (c.name !== op.column) return c
            return {
              ...c,
              ...(updates.name     !== undefined && { name:     updates.name     }),
              ...(updates.type     !== undefined && { type:     updates.type     }),
              ...(updates.primary  !== undefined && { primary:  updates.primary  }),
              ...(updates.required !== undefined && { required: updates.required }),
              ...(updates.options  !== undefined && { options:  updates.options  }),
              ...(updates.currency !== undefined && { currency: updates.currency }),
              ...(updates.formula  !== undefined && { formula:  updates.formula  }),
              ...(updates.format   !== undefined && { format:   updates.format   }),
            }
          }),
          // Cells are positional — renaming a column does not move cell data
        }))
        break
      }

      case 'addRow': {
        const sheet = this._findSheet(op.sheet, 'addRow')
        const cells = sheet.columns.map((col) => ({
          kind: 'cell' as const,
          value: op.values[col.name] ?? null,
        }))
        const newRow: RowNode = { kind: 'row', cells }
        this._mutateSheet(op.sheet, (s) => {
          const rows = [...s.rows]
          if (op.at !== undefined) rows.splice(op.at, 0, newRow)
          else rows.push(newRow)
          return { ...s, rows }
        })
        break
      }

      case 'updateCell': {
        const sheet = this._findSheet(op.sheet, 'updateCell')
        this._assertRowInBounds(sheet, op.rowIndex, 'updateCell')
        const colIdx = this._findColumn(sheet, op.column, 'updateCell')
        this._mutateSheet(op.sheet, (s) => ({
          ...s,
          rows: s.rows.map((r, ri) => {
            if (ri !== op.rowIndex) return r
            return {
              ...r,
              cells: r.cells.map((cell, ci) => {
                if (ci !== colIdx) return cell
                return {
                  ...cell,
                  ...(op.value   !== undefined && { value:   op.value   }),
                  ...(op.formula !== undefined && { formula: op.formula }),
                  ...(op.format  !== undefined && { format:  op.format  }),
                  ...(op.color   !== undefined && { color:   op.color   }),
                  ...(op.bold    !== undefined && { bold:    op.bold    }),
                }
              }),
            }
          }),
        }))
        break
      }

      case 'removeRow': {
        const sheet = this._findSheet(op.sheet, 'removeRow')
        this._assertRowInBounds(sheet, op.rowIndex, 'removeRow')
        this._mutateSheet(op.sheet, (s) => ({
          ...s,
          rows: s.rows.filter((_, i) => i !== op.rowIndex),
        }))
        break
      }

      case 'addChart': {
        this._findSheet(op.sheet, 'addChart')
        this._mutateSheet(op.sheet, (s) => ({
          ...s,
          charts: [...s.charts, { kind: 'chart', ...op.chart }],
        }))
        break
      }
    }
  }
}

/** Convenience factory — `wb('Name').sheet(...)`. */
export function wb(name: string): WorkbookBuilder {
  return new WorkbookBuilder(name)
}

/**
 * Deserialize an existing WorkbookNode back into a WorkbookBuilder for further
 * modification. The builder holds a deep copy — the original node is not mutated.
 *
 * @example
 * const builder = fromWorkbook(existingNode)
 * builder.applyPatch({ op: 'addRow', sheet: 'Sales', values: { region: 'APAC', rev: 100 } })
 * const updated = builder.build()
 */
export function fromWorkbook(node: WorkbookNode): WorkbookBuilder {
  const sheets = node.sheets.map((s): SheetNode => ({
    kind: 'sheet',
    name: s.name,
    columns: s.columns.map((c) => ({ ...c })),
    sections: s.sections.map((sec) => ({
      kind: 'section',
      title: sec.title,
      rows: sec.rows.map((r) => ({
        kind: 'row',
        header: r.header,
        cells: r.cells.map((c) => ({ ...c })),
      })),
    })),
    rows: s.rows.map((r) => ({
      kind: 'row',
      header: r.header,
      cells: r.cells.map((c) => ({ ...c })),
    })),
    charts: s.charts.map((ch) => ({ ...ch, series: ch.series.map((ser) => ({ ...ser })) })),
    ...(s.header     !== undefined && { header:     { ...s.header }     }),
    ...(s.pagination !== undefined && { pagination: { ...s.pagination } }),
    ...(s.theme      !== undefined && { theme:      s.theme             }),
  }))
  return new WorkbookBuilder(node.name, sheets)
}
