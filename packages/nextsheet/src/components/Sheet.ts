import type {
  ChartNode,
  ColumnNode,
  HeaderNode,
  RowNode,
  SectionNode,
  SheetNode,
  SheetProps,
} from '../types.js'

function isColumnNode(v: unknown): v is ColumnNode {
  return typeof v === 'object' && v !== null && (v as ColumnNode).kind === 'column'
}
function isSectionNode(v: unknown): v is SectionNode {
  return typeof v === 'object' && v !== null && (v as SectionNode).kind === 'section'
}
function isRowNode(v: unknown): v is RowNode {
  return typeof v === 'object' && v !== null && (v as RowNode).kind === 'row'
}
function isHeaderNode(v: unknown): v is HeaderNode {
  return typeof v === 'object' && v !== null && (v as HeaderNode).kind === 'header'
}
function isChartNode(v: unknown): v is ChartNode {
  return typeof v === 'object' && v !== null && (v as ChartNode).kind === 'chart'
}

export function Sheet({ name = 'Sheet', theme, children }: SheetProps): SheetNode {
  const raw = Array.isArray(children) ? children : children !== undefined ? [children] : []
  const flat = raw.flat()

  const header = flat.find(isHeaderNode)
  const columns = flat.filter(isColumnNode)
  const sections = flat.filter(isSectionNode)
  // Rows placed directly under Sheet become an implicit unnamed section
  const directRows = flat.filter(isRowNode)
  const charts = flat.filter(isChartNode)

  return {
    kind: 'sheet',
    name,
    theme,
    header,
    columns,
    sections,
    rows: directRows,
    charts,
  }
}
