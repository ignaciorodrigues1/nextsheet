// ─── JSX Component prop types ──────────────────────────────────────────────────
// Each interface corresponds to a component exported from "nextsheet".
// Full JSDoc so editors show descriptions on hover.

import type {
  CellColor,
  ChartPoint,
  ChartSeriesNode,
  ChartType,
  ColumnNode,
  ColumnType,
  FormulaNode,
  SheetNode,
  SheetTheme,
} from './nodes.js'

/**
 * Children in NextSheet JSX are immediate IR nodes, not React elements.
 * The type is `unknown` at the JSX level; components narrow at runtime.
 */
export type NxtChildren = unknown

// ─── <Sheet> ──────────────────────────────────────────────────────────────────

export interface SheetProps {
  /** Sheet tab name shown in xlsx and the HTML preview. Defaults to `"Sheet"`. */
  readonly name?: string
  /** Visual theme preset. Defaults to `"default"`. */
  readonly theme?: SheetTheme
  readonly children?: NxtChildren | NxtChildren[]
}

// ─── <Header> ─────────────────────────────────────────────────────────────────

export interface HeaderProps {
  /** Large title rendered at the top of the sheet. */
  readonly title: string
  /** Smaller subtitle rendered below the title. */
  readonly subtitle?: string
}

// ─── <Column> ─────────────────────────────────────────────────────────────────

export interface ColumnProps<T extends ColumnType = ColumnType> {
  /** Column identifier — must match the keys of your row data objects. */
  readonly name: string
  /**
   * Data type used for formatting in xlsx and HTML output.
   * - `"string"` — plain text
   * - `"number"` — numeric with optional format
   * - `"currency"` — currency symbol + decimal places (see `currency`)
   * - `"boolean"` — checkbox in xlsx
   * - `"date"` — ISO 8601 date string formatted per locale
   * - `"percent"` — 0-1 value displayed as percentage
   */
  readonly type: T
  /** Marks this column as the primary key / identifier. */
  readonly primary?: boolean
  /** Enforces a value is present on every row when building to xlsx. */
  readonly required?: boolean
  /** Fallback value used when a row's cell is `undefined`. */
  readonly default?: unknown
  /**
   * Spreadsheet formula for this column.
   * Receives column name references — use with `<Formula>` to transpile.
   *
   * @example
   * ```tsx
   * <Column
   *   name="total"
   *   type="currency"
   *   formula={({ qty, price }) => <Formula>{qty} * {price}</Formula>}
   * />
   * ```
   */
  readonly formula?: (cols: Record<string, string>) => FormulaNode | unknown
  /** ISO 4217 currency code (e.g. `"USD"`, `"EUR"`). Only used when `type="currency"`. */
  readonly currency?: string
  /** Custom number format string (xlsx format codes, e.g. `"#,##0.00"`). */
  readonly format?: string
}

// ─── <Section> ────────────────────────────────────────────────────────────────

export interface SectionProps {
  /** Section heading rendered as a sub-header row in xlsx and HTML. */
  readonly title?: string
  readonly children?: NxtChildren | NxtChildren[]
}

// ─── <Row> ────────────────────────────────────────────────────────────────────

export interface RowProps {
  /** When `true`, renders the row using the header style (bold + primary background). */
  readonly header?: boolean
  /** Stable identity key used to reconcile rows during live-backend polling. */
  readonly key?: string | number
  readonly children?: NxtChildren | NxtChildren[]
}

// ─── <Cell> ───────────────────────────────────────────────────────────────────

export interface CellProps {
  /** Number / date format string applied to this cell's value in xlsx. */
  readonly format?: string
  /** Background color of the cell. Accepts named colors or any hex string. */
  readonly color?: CellColor
  /** Renders the cell value in bold. */
  readonly bold?: boolean
  /** Number of columns this cell should span (like HTML `colspan`). */
  readonly colspan?: number
  readonly children?: NxtChildren
}

// ─── <Formula> ────────────────────────────────────────────────────────────────

export interface FormulaProps {
  /**
   * The formula expression. Column references are JS expressions at dev time;
   * they transpile to native `=SUM(B:B)` formulas in xlsx / SuperSheet output.
   *
   * @example
   * ```tsx
   * <Formula>{qty} * {price}</Formula>
   * ```
   */
  readonly children: NxtChildren
}

// ─── <ChartSeries> ────────────────────────────────────────────────────────────

export interface ChartSeriesProps {
  /** Label shown in the chart legend. */
  readonly name: string
  /** References a `<Column>` by name to use its values as data points. */
  readonly column?: string
  /** Inline numeric data (use instead of `column` for static charts). */
  readonly data?: readonly number[]
  /** XY scatter/bubble data points. */
  readonly points?: readonly ChartPoint[]
  /** Series accent color (hex or CSS color name). Overrides the theme. */
  readonly color?: string
}

// ─── <Chart> ──────────────────────────────────────────────────────────────────

export interface ChartProps {
  /**
   * Chart variant.
   * - `"bar"` / `"horizontal-bar"` — grouped bar charts
   * - `"line"` / `"area"` — line and filled-area charts
   * - `"stacked-bar"` / `"stacked-area"` — stacked variants
   * - `"pie"` / `"donut"` — circular proportion charts
   * - `"scatter"` / `"bubble"` — XY scatter plots
   * - `"radar"` — spider / radar chart
   */
  readonly type: ChartType
  /** Title rendered above the chart. */
  readonly title?: string
  /** Label for the X axis. */
  readonly xAxis?: string
  /** Show the series legend. Defaults to `false`. */
  readonly showLegend?: boolean
  /** Chart width in pixels (HTML preview) or columns (xlsx). */
  readonly width?: number
  /** Chart height in pixels (HTML preview) or rows (xlsx). */
  readonly height?: number
  readonly children?: NxtChildren | NxtChildren[]
}

// ─── <Paginate> ───────────────────────────────────────────────────────────────

export interface PaginateProps {
  /**
   * Maximum number of data rows displayed per page in the HTML dev preview.
   * When building to xlsx or csv, all rows are always written (pagination is ignored).
   *
   * @example
   * ```tsx
   * <Sheet>
   *   <Paginate pageSize={50} />
   *   <Column name="id" type="number" primary />
   *   ...
   * </Sheet>
   * ```
   */
  readonly pageSize: number
  /** Starting page (1-based). Defaults to `1`. */
  readonly initialPage?: number
}

// ─── defineSheet ──────────────────────────────────────────────────────────────

export interface SheetDefinition {
  readonly _type: 'SheetDefinition'
  readonly name: string
  readonly render: () => unknown
}

// ─── Column formula helpers ───────────────────────────────────────────────────

export type ColumnRefs<T extends Record<string, unknown> = Record<string, string>> = {
  readonly [K in keyof T]: string
}
