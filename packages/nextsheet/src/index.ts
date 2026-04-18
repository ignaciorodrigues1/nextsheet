// ─── Components ───────────────────────────────────────────────────────────────
export { Cell } from './components/Cell.js'
export { Paginate } from './components/Paginate.js'
export { Chart } from './components/Chart.js'
export { ChartSeries } from './components/ChartSeries.js'
export { Column } from './components/Column.js'
export { Formula } from './components/Formula.js'
export { Header } from './components/Header.js'
export { Row } from './components/Row.js'
export { Section } from './components/Section.js'
export { Sheet } from './components/Sheet.js'

// ─── Runtime ─────────────────────────────────────────────────────────────────
export { defineSheet } from './runtime/defineSheet.js'
export { workbook } from './runtime/workbook.js'

// ─── Range context (used by CLI for two-pass live-backend rendering) ──────────
export {
  startCollecting,
  stopCollecting,
  populateCache,
  clearRangeCache,
} from './runtime/range-context.js'

// ─── Formula context (used by CLI for formula transpilation) ──────────────────
export { enterFormulaMode, exitFormulaMode } from './formula/context.js'

// ─── Formula helper functions ─────────────────────────────────────────────────
export {
  col,
  SUM,
  AVERAGE,
  COUNT,
  COUNTA,
  COUNTIF,
  SUMIF,
  MIN,
  MAX,
  ROUND,
  IF,
  CONCATENATE,
} from './formula/functions.js'

// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useFormula } from './hooks/useFormula.js'
export { useQuery } from './hooks/useQuery.js'
export { useRange } from './hooks/useRange.js'

// ─── Adapters ────────────────────────────────────────────────────────────────
export { CsvAdapter, csvAdapter } from './adapters/csv.js'
export { XlsxAdapter, xlsxAdapter } from './adapters/xlsx.js'
export { SuperSheetAdapter, superSheetAdapter } from './adapters/supersheet.js'
export type { NextSheetOutput } from './adapters/supersheet.js'

// ─── Config ──────────────────────────────────────────────────────────────────
export { defineConfig, setActiveConfig, getActiveConfig } from './config.js'
export type {
  NextSheetConfig,
  NextSheetTheme,
  NextSheetColors,
  NextSheetTypography,
  NextSheetSheet,
} from './config.js'

// ─── Types — core ─────────────────────────────────────────────────────────────
export type {
  // nodes
  CellColor,
  CellNode,
  ChartNode,
  ChartPoint,
  ChartSeriesNode,
  ChartType,
  ColumnNode,
  ColumnType,
  FormulaNode,
  HeaderNode,
  PaginateNode,
  RowNode,
  SectionNode,
  SheetChild,
  SheetNode,
  SheetTheme,
  WorkbookNode,
  // component props
  CellProps,
  ChartProps,
  ChartSeriesProps,
  ColumnProps,
  ColumnRefs,
  FormulaProps,
  HeaderProps,
  NxtChildren,
  PaginateProps,
  RowProps,
  SectionProps,
  SheetDefinition,
  SheetProps,
  // hooks
  FilterOperator,
  RangeQuery,
  SortDirection,
  UseRangeOptions,
  // adapters
  Adapter,
  BuildOptions,
  BuildTarget,
  RenderResult,
} from './types/index.js'

// ─── Types — enterprise ───────────────────────────────────────────────────────
export type {
  AuditAction,
  AuditEntry,
  AuditFilter,
  AuditLog,
  BuildMetrics,
  BuildVersion,
  ConnectorConfig,
  ConnectorFetchOptions,
  CronExpression,
  DataConnector,
  Delivery,
  DeliveryChannel,
  EmailDelivery,
  GraphQLConnectorConfig,
  HealthStatus,
  IdentityToken,
  Permission,
  PermissionCheck,
  RestConnectorConfig,
  Role,
  RoleBinding,
  ScheduledBuild,
  ScheduledJobStatus,
  SlackDelivery,
  SqlConnectorConfig,
  SsoConfig,
  SsoProvider,
  VersionStore,
  WebhookDelivery,
} from './types/enterprise.js'
