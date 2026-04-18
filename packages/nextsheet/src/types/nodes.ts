// ─── Internal IR node types ────────────────────────────────────────────────────
// These are the intermediate representation that adapters (xlsx, csv, html) consume.
// User code never constructs these directly — JSX components return them.

export type ChartType =
  | 'bar'
  | 'horizontal-bar'
  | 'line'
  | 'area'
  | 'stacked-bar'
  | 'stacked-area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'bubble'
  | 'radar'

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

export interface FormulaNode {
  readonly kind: 'formula'
  readonly expression: string
}

export interface ChartPoint {
  readonly x: number
  readonly y: number
  readonly r?: number
}

export interface ChartSeriesNode {
  readonly kind: 'chart-series'
  readonly name: string
  readonly column?: string
  readonly data?: readonly number[]
  readonly points?: readonly ChartPoint[]
  readonly color?: string
}

export interface ChartNode {
  readonly kind: 'chart'
  readonly type: ChartType
  readonly title?: string
  readonly xAxis?: string
  readonly showLegend?: boolean
  readonly series: ChartSeriesNode[]
  readonly width?: number
  readonly height?: number
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
  /** Valid values for this column. Renders as a filter dropdown in the HTML preview and data-validation in xlsx. */
  readonly options?: readonly string[]
}

export interface PaginateNode {
  readonly kind: 'paginate'
  /** Number of data rows visible per page in the HTML preview. */
  readonly pageSize: number
  /** Initial page (1-based). Defaults to 1. */
  readonly initialPage?: number
}

export interface SheetNode {
  readonly kind: 'sheet'
  readonly name: string
  readonly theme?: SheetTheme
  readonly header?: HeaderNode
  readonly columns: ColumnNode[]
  readonly sections: SectionNode[]
  readonly rows: RowNode[]
  readonly charts: ChartNode[]
  readonly pagination?: PaginateNode
}

export interface WorkbookNode {
  readonly kind: 'workbook'
  readonly name: string
  readonly sheets: SheetNode[]
}

/** Union of every node a Sheet can directly contain. */
export type SheetChild =
  | ColumnNode
  | SectionNode
  | RowNode
  | HeaderNode
  | ChartNode
