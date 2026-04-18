// ─── JSON Schema for WorkbookNode ─────────────────────────────────────────────
// Used for LLM output validation and tool parameter schemas.

const CELL_COLOR_ENUM = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'gray']
const COLUMN_TYPE_ENUM = ['string', 'number', 'currency', 'boolean', 'date', 'percent']
const CHART_TYPE_ENUM  = ['bar', 'horizontal-bar', 'line', 'area', 'stacked-bar', 'stacked-area', 'pie', 'donut', 'scatter', 'bubble', 'radar']

export const cellSchema = {
  type: 'object',
  properties: {
    value: { oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'null' }] },
    formula: { type: 'string' },
    color: { type: 'string', enum: CELL_COLOR_ENUM },
    bold: { type: 'boolean' },
    colspan: { type: 'integer', minimum: 1 },
  },
} as const

export const columnSchema = {
  type: 'object',
  required: ['name', 'type'],
  properties: {
    name: { type: 'string' },
    type: { type: 'string', enum: COLUMN_TYPE_ENUM },
    primary: { type: 'boolean' },
    required: { type: 'boolean' },
    currency: { type: 'string', description: 'ISO 4217 currency code, e.g. "USD"' },
    formula: { type: 'string', description: 'Spreadsheet formula referencing column names as variables' },
    options: { type: 'array', items: { type: 'string' }, description: 'Allowed values for this column (renders as dropdown filter)' },
  },
} as const

export const rowSchema = {
  type: 'object',
  required: ['cells'],
  properties: {
    header: { type: 'boolean' },
    cells: { type: 'array', items: cellSchema },
  },
} as const

export const sectionSchema = {
  type: 'object',
  required: ['rows'],
  properties: {
    title: { type: 'string' },
    rows: { type: 'array', items: rowSchema },
  },
} as const

export const sheetSchema = {
  type: 'object',
  required: ['name', 'columns', 'sections', 'rows'],
  properties: {
    name: { type: 'string' },
    header: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
      },
    },
    columns: { type: 'array', items: columnSchema },
    sections: { type: 'array', items: sectionSchema },
    rows: { type: 'array', items: rowSchema },
    pagination: {
      type: 'object',
      required: ['pageSize'],
      properties: {
        pageSize: { type: 'integer', minimum: 1 },
        initialPage: { type: 'integer', minimum: 1 },
      },
    },
    charts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'series'],
        properties: {
          type: { type: 'string', enum: CHART_TYPE_ENUM },
          title: { type: 'string' },
          xAxis: { type: 'string', description: 'Column name to use as x-axis labels' },
          showLegend: { type: 'boolean' },
          width: { type: 'integer' },
          height: { type: 'integer' },
          series: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string' },
                column: { type: 'string', description: 'Column name to read data from' },
                data: { type: 'array', items: { type: 'number' } },
                color: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
} as const

export const workbookSchema = {
  type: 'object',
  required: ['name', 'sheets'],
  description: 'A NextSheet workbook with one or more spreadsheet sheets.',
  properties: {
    name: { type: 'string', description: 'Workbook title' },
    sheets: {
      type: 'array',
      items: sheetSchema,
      description: 'Array of sheets in display order',
    },
  },
} as const

// ─── Patch operation schemas (for tool use) ───────────────────────────────────

export const addRowSchema = {
  type: 'object',
  required: ['op', 'sheet', 'values'],
  properties: {
    op: { type: 'string', enum: ['addRow'] },
    sheet: { type: 'string' },
    values: { type: 'object', additionalProperties: true },
    at: { type: 'integer', description: 'Row index to insert before (0-based). Omit to append.' },
  },
} as const

export const updateCellSchema = {
  type: 'object',
  required: ['op', 'sheet', 'rowIndex', 'column', 'value'],
  properties: {
    op: { type: 'string', enum: ['updateCell'] },
    sheet: { type: 'string' },
    rowIndex: { type: 'integer', minimum: 0 },
    column: { type: 'string' },
    value: { oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'null' }] },
    color: { type: 'string', enum: CELL_COLOR_ENUM },
    bold: { type: 'boolean' },
  },
} as const

export const removeRowSchema = {
  type: 'object',
  required: ['op', 'sheet', 'rowIndex'],
  properties: {
    op: { type: 'string', enum: ['removeRow'] },
    sheet: { type: 'string' },
    rowIndex: { type: 'integer', minimum: 0 },
  },
} as const

export const addColumnSchema = {
  type: 'object',
  required: ['op', 'sheet', 'name', 'type'],
  properties: {
    op: { type: 'string', enum: ['addColumn'] },
    sheet: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string', enum: COLUMN_TYPE_ENUM },
    required: { type: 'boolean' },
    primary: { type: 'boolean' },
    options: { type: 'array', items: { type: 'string' } },
    currency: { type: 'string' },
    formula: { type: 'string' },
    at: { type: 'integer' },
  },
} as const

export const patchSchema = {
  oneOf: [addRowSchema, updateCellSchema, removeRowSchema, addColumnSchema],
} as const
