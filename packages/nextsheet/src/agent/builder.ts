import type {
  CellColor,
  CellNode,
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

// ─── Cell builder ─────────────────────────────────────────────────────────────

export class CellBuilder {
  private _value: string | number | boolean | null = null
  private _formula?: string
  private _color?: CellColor
  private _bold?: boolean
  private _colspan?: number

  value(v: string | number | boolean | null): this { this._value = v; return this }
  formula(f: string): this { this._formula = f; return this }
  color(c: CellColor): this { this._color = c; return this }
  bold(b = true): this { this._bold = b; return this }
  span(n: number): this { this._colspan = n; return this }

  build(): CellNode {
    return {
      kind: 'cell',
      value: this._value ?? undefined,
      ...(this._formula !== undefined && { formula: this._formula }),
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

  cell(value: string | number | boolean | null, opts?: { color?: CellColor; bold?: boolean }): this {
    this._cells.push({
      kind: 'cell',
      value,
      ...(opts?.color !== undefined && { color: opts.color }),
      ...(opts?.bold  !== undefined && { bold:  opts.bold  }),
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

  build(): SheetNode {
    return {
      kind: 'sheet',
      name: this._name,
      columns: this._columns,
      sections: this._sections,
      rows: this._rows,
      charts: [],
      ...(this._header     !== undefined && { header:     this._header     }),
      ...(this._pagination !== undefined && { pagination: this._pagination }),
    }
  }
}

// ─── Workbook builder ─────────────────────────────────────────────────────────

export class WorkbookBuilder {
  private _name: string
  private _sheets: SheetNode[] = []

  constructor(name: string) { this._name = name }

  sheet(name: string, configure: (s: SheetBuilder) => void): this {
    const b = new SheetBuilder(name)
    configure(b)
    this._sheets.push(b.build())
    return this
  }

  addSheet(sheet: SheetNode): this { this._sheets.push(sheet); return this }

  /** Apply a sequence of patch operations to the workbook in memory. */
  applyPatch(...ops: PatchOperation[]): this {
    for (const op of ops) this._applyOne(op)
    return this
  }

  build(): WorkbookNode {
    return { kind: 'workbook', name: this._name, sheets: this._sheets }
  }

  private _applyOne(op: PatchOperation): void {
    switch (op.op) {
      case 'addSheet': {
        this._sheets.push({ kind: 'sheet', name: op.name, columns: [], sections: [], rows: [], charts: [] })
        break
      }
      case 'renameSheet': {
        this._sheets = this._sheets.map((s) =>
          s.name === op.sheet ? { ...s, name: op.newName } : s
        )
        break
      }
      case 'setHeader': {
        this._sheets = this._sheets.map((s) =>
          s.name === op.sheet
            ? { ...s, header: { kind: 'header', title: op.title, ...(op.subtitle !== undefined && { subtitle: op.subtitle }) } }
            : s
        )
        break
      }
      case 'addColumn': {
        this._sheets = this._sheets.map((s) => {
          if (s.name !== op.sheet) return s
          const newCol: ColumnNode = {
            kind: 'column', name: op.name, type: op.type,
            ...(op.primary  !== undefined && { primary:  op.primary  }),
            ...(op.required !== undefined && { required: op.required }),
            ...(op.options  !== undefined && { options:  op.options  }),
            ...(op.currency !== undefined && { currency: op.currency }),
            ...(op.formula  !== undefined && { formula:  op.formula  }),
          }
          const cols = [...s.columns]
          if (op.at !== undefined) cols.splice(op.at, 0, newCol)
          else cols.push(newCol)
          return { ...s, columns: cols }
        })
        break
      }
      case 'removeColumn': {
        this._sheets = this._sheets.map((s) =>
          s.name !== op.sheet ? s : { ...s, columns: s.columns.filter((c) => c.name !== op.column) }
        )
        break
      }
      case 'addRow': {
        this._sheets = this._sheets.map((s) => {
          if (s.name !== op.sheet) return s
          const cells = s.columns.map((col) => ({
            kind: 'cell' as const,
            value: op.values[col.name] ?? null,
          }))
          const newRow: RowNode = { kind: 'row', cells }
          const rows = [...s.rows]
          if (op.at !== undefined) rows.splice(op.at, 0, newRow)
          else rows.push(newRow)
          return { ...s, rows }
        })
        break
      }
      case 'updateCell': {
        this._sheets = this._sheets.map((s) => {
          if (s.name !== op.sheet) return s
          const rows = s.rows.map((r, ri) => {
            if (ri !== op.rowIndex) return r
            const colIdx = s.columns.findIndex((c) => c.name === op.column)
            if (colIdx === -1) return r
            const cells = r.cells.map((cell, ci) =>
              ci === colIdx
                ? {
                    ...cell,
                    value: op.value,
                    ...(op.color !== undefined && { color: op.color }),
                    ...(op.bold  !== undefined && { bold:  op.bold  }),
                  }
                : cell
            )
            return { ...r, cells }
          })
          return { ...s, rows }
        })
        break
      }
      case 'removeRow': {
        this._sheets = this._sheets.map((s) =>
          s.name !== op.sheet ? s : { ...s, rows: s.rows.filter((_, i) => i !== op.rowIndex) }
        )
        break
      }
    }
  }
}

/** Convenience factory — `wb('Name').sheet(...)`. */
export function wb(name: string): WorkbookBuilder {
  return new WorkbookBuilder(name)
}
