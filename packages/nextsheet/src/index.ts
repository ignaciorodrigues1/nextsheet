// ─── Components ───────────────────────────────────────────────────────────────
export { Cell } from './components/Cell.js'
export { Column } from './components/Column.js'
export { Formula } from './components/Formula.js'
export { Header } from './components/Header.js'
export { Row } from './components/Row.js'
export { Section } from './components/Section.js'
export { Sheet } from './components/Sheet.js'

// ─── Runtime ─────────────────────────────────────────────────────────────────
export { defineSheet } from './runtime/defineSheet.js'
export { workbook } from './runtime/workbook.js'

// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useFormula } from './hooks/useFormula.js'
export { useQuery } from './hooks/useQuery.js'
export { useRange } from './hooks/useRange.js'

// ─── Adapters ────────────────────────────────────────────────────────────────
export { CsvAdapter, csvAdapter } from './adapters/csv.js'
export { XlsxAdapter, xlsxAdapter } from './adapters/xlsx.js'
export { SuperSheetAdapter, superSheetAdapter } from './adapters/supersheet.js'
export type { NextSheetOutput } from './adapters/supersheet.js'

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  Adapter,
  BuildOptions,
  BuildTarget,
  CellColor,
  CellNode,
  CellProps,
  ColumnNode,
  ColumnProps,
  ColumnRefs,
  ColumnType,
  FormulaNode,
  FormulaProps,
  HeaderNode,
  HeaderProps,
  RangeQuery,
  RenderResult,
  RowNode,
  RowProps,
  SectionNode,
  SectionProps,
  SheetDefinition,
  SheetNode,
  SheetProps,
  SheetTheme,
  WorkbookNode,
} from './types.js'
