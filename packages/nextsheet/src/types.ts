// ─── Column types ────────────────────────────────────────────────────────────

export type ColumnType =
  | 'string'
  | 'number'
  | 'currency'
  | 'boolean'
  | 'date'
  | 'percent'

export type CellColor =
  | 'red'
  | 'green'
  | 'blue'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'gray'
  | (string & {})

export type SheetTheme = 'default' | 'minimal' | 'dark'

// ─── IR nodes ─────────────────────────────────────────────────────────────────
// These are the internal representation that adapters consume.

export interface FormulaNode {
  readonly kind: 'formula'
  readonly expression: string
}

export interface CellNode {
  readonly kind: 'cell'
  readonly value?: string | number | boolean | null
  readonly formula?: string
  readonly format?: string
  readonly color?: CellColor
  readonly bold?: boolean
  readonly colspan?: number
}

export interface RowNode {
  readonly kind: 'row'
  readonly header?: boolean
  readonly cells: CellNode[]
}

export interface SectionNode {
  readonly kind: 'section'
  readonly title?: string
  readonly rows: RowNode[]
}

export interface HeaderNode {
  readonly kind: 'header'
  readonly title: string
  readonly subtitle?: string
}

export interface ColumnNode {
  readonly kind: 'column'
  readonly name: string
  readonly type: ColumnType
  readonly primary?: boolean
  readonly required?: boolean
  readonly default?: unknown
  readonly formula?: string
  readonly currency?: string
  readonly format?: string
}

export interface SheetNode {
  readonly kind: 'sheet'
  readonly name: string
  readonly theme?: SheetTheme
  readonly header?: HeaderNode
  readonly columns: ColumnNode[]
  readonly sections: SectionNode[]
  readonly rows: RowNode[]
}

export interface WorkbookNode {
  readonly kind: 'workbook'
  readonly name: string
  readonly sheets: SheetNode[]
}

// ─── Sheet definition (produced by defineSheet) ───────────────────────────────

export interface SheetDefinition {
  readonly _type: 'SheetDefinition'
  readonly name: string
  readonly render: () => SheetNode
}

// ─── Column formula refs ──────────────────────────────────────────────────────
// The formula prop receives column name references as strings so that adapters
// can later resolve them to actual cell addresses (e.g. B2, SUM(B:B)).

export type ColumnRefs<T extends Record<string, unknown> = Record<string, string>> = {
  readonly [K in keyof T]: string
}

// ─── Adapter interface ────────────────────────────────────────────────────────

export interface RenderResult {
  readonly mimeType: string
  readonly extension: string
  readonly data: Buffer | string
}

export interface Adapter {
  readonly name: string
  render(workbook: WorkbookNode): Promise<RenderResult>
}

// ─── Build / deploy options ───────────────────────────────────────────────────

export type BuildTarget = 'csv' | 'xlsx' | 'google' | 'excel-online'

export interface BuildOptions {
  readonly target: BuildTarget
  readonly out?: string
  readonly data?: Record<string, unknown[]>
}

// ─── Hook types ───────────────────────────────────────────────────────────────

export interface RangeQuery<T> {
  orderBy(field: keyof T, direction?: 'asc' | 'desc'): RangeQuery<T>
  where(field: keyof T, op: '==' | '!=' | '<' | '<=' | '>' | '>=', value: unknown): RangeQuery<T>
  limit(n: number): RangeQuery<T>
  first(): T | undefined
  toArray(): T[]
}

// ─── Component prop types ─────────────────────────────────────────────────────

export interface SheetProps {
  readonly name?: string
  readonly theme?: SheetTheme
  readonly children?: SheetChild | SheetChild[]
}

export interface ColumnProps<T extends ColumnType = ColumnType> {
  readonly name: string
  readonly type: T
  readonly primary?: boolean
  readonly required?: boolean
  readonly default?: unknown
  readonly formula?: (cols: Record<string, string>) => FormulaNode
  readonly currency?: string
  readonly format?: string
}

export interface SectionProps {
  readonly title?: string
  readonly children?: RowNode | RowNode[]
}

export interface RowProps {
  readonly header?: boolean
  readonly key?: string | number
  readonly children?: CellNode | CellNode[]
}

export interface CellProps {
  readonly format?: string
  readonly color?: CellColor
  readonly bold?: boolean
  readonly colspan?: number
  readonly children?: string | number | boolean | null | undefined | FormulaNode
}

export interface HeaderProps {
  readonly title: string
  readonly subtitle?: string
}

export interface FormulaProps {
  readonly children: string
}

// Union of all possible children under Sheet
export type SheetChild = ColumnNode | SectionNode | RowNode | HeaderNode
