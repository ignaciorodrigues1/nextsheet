/**
 * SuperSheet adapter — converts a NextSheet WorkbookNode into SuperSheet's
 * WorkbookData format so projects can be imported and hosted on supersheet.app.
 *
 * The output is a JSON file (nextsheet.output.json) that SuperSheet reads
 * directly — no server-side compilation needed at import time.
 */

import type {
  CellNode,
  ColumnNode,
  RenderResult,
  RowNode,
  SectionNode,
  SheetNode,
  WorkbookNode,
} from '../types.js'
import { BaseAdapter } from './base.js'

// ─── SuperSheet internal types (mirrored here to stay self-contained) ─────────

type CellValue = string | number | null

interface SuperCellFormat {
  bold?: boolean
  italic?: boolean
  textColor?: string
  bgColor?: string
  fontSize?: number
  numberFormat?: 'auto' | 'number' | 'currency' | 'percent' | 'decimal2' | 'text'
  textAlign?: 'left' | 'center' | 'right'
}

interface SuperCellData {
  value: CellValue
  formula?: string
  format?: SuperCellFormat
}

type SuperSheetData = Record<string, SuperCellData>

interface SuperWorkbookData {
  sheets: Record<string, SuperSheetData>
  sheetOrder: string[]
}

/** The output file format. SuperSheet detects _nextsheet to know it's a NextSheet project. */
export interface NextSheetOutput {
  readonly _nextsheet: true
  readonly version: string
  readonly name: string
  readonly workbookData: SuperWorkbookData
  readonly buildAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function colLabel(index: number): string {
  let label = ''
  let n = index
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label
    n = Math.floor(n / 26) - 1
  }
  return label
}

function cellId(col: number, row: number): string {
  return `${colLabel(col)}${row + 1}`
}

function cellColor(color: string | undefined): string | undefined {
  if (color === undefined) return undefined
  const map: Record<string, string> = {
    red: '#ef4444',
    green: '#22c55e',
    blue: '#3b82f6',
    yellow: '#eab308',
    orange: '#f97316',
    purple: '#a855f7',
    gray: '#6b7280',
  }
  return map[color] ?? color
}

function colTypeToNumberFormat(
  type: ColumnNode['type']
): SuperCellFormat['numberFormat'] | undefined {
  switch (type) {
    case 'currency': return 'currency'
    case 'percent':  return 'percent'
    case 'number':   return 'number'
    default:         return undefined
  }
}

function superCell(cell: CellNode, colHint?: ColumnNode): SuperCellData {
  const format: SuperCellFormat = {}

  if (cell.bold === true)      format.bold = true
  if (cell.color !== undefined) format.textColor = cellColor(cell.color)

  const numFmt = cell.format ?? colHint?.type
  if (numFmt === 'currency' || numFmt === 'currency') format.numberFormat = 'currency'
  else if (numFmt === 'percent') format.numberFormat = 'percent'
  else if (numFmt === 'number' || colHint?.type === 'number') format.numberFormat = 'number'
  if (colHint !== undefined) {
    const inferred = colTypeToNumberFormat(colHint.type)
    if (inferred !== undefined) format.numberFormat = inferred
  }

  const entry: SuperCellData = {
    value: (cell.value ?? null) as CellValue,
  }

  if (cell.formula !== undefined)    entry.formula = cell.formula
  if (Object.keys(format).length > 0) entry.format = format

  return entry
}

function applyRow(
  sheetData: SuperSheetData,
  row: RowNode,
  rowIdx: number,
  columns: ColumnNode[],
  isHeader?: boolean
): void {
  row.cells.forEach((cell, colIdx) => {
    const key = cellId(colIdx, rowIdx)
    const colHint = columns[colIdx]
    const data = superCell(cell, colHint)

    if (isHeader === true || row.header === true) {
      data.format = { ...data.format, bold: true }
    }

    sheetData[key] = data
  })
}

function convertSheet(sheet: SheetNode): SuperSheetData {
  const data: SuperSheetData = {}
  let row = 0 // 0-based row index → cellId adds +1

  // Header block
  if (sheet.header !== undefined) {
    data[cellId(0, row)] = {
      value: sheet.header.title,
      format: { bold: true, fontSize: 14 },
    }
    row++
    if (sheet.header.subtitle !== undefined) {
      data[cellId(0, row)] = { value: sheet.header.subtitle }
      row++
    }
    row++ // blank separator
  }

  // Column header row (schema mode)
  if (sheet.columns.length > 0) {
    sheet.columns.forEach((col, colIdx) => {
      data[cellId(colIdx, row)] = {
        value: col.name,
        format: { bold: true },
      }
    })
    row++
  }

  // Sections
  for (const section of sheet.sections) {
    if (section.title !== undefined) {
      data[cellId(0, row)] = { value: section.title, format: { bold: true } }
      row++
    }
    for (const sheetRow of section.rows) {
      applyRow(data, sheetRow, row, sheet.columns)
      row++
    }
  }

  // Direct rows under Sheet
  for (const sheetRow of sheet.rows) {
    applyRow(data, sheetRow, row, sheet.columns)
    row++
  }

  return data
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

export class SuperSheetAdapter extends BaseAdapter {
  readonly name = 'supersheet'

  async render(workbook: WorkbookNode): Promise<RenderResult> {
    const superWorkbook: SuperWorkbookData = {
      sheets: {},
      sheetOrder: [],
    }

    for (const sheet of workbook.sheets) {
      superWorkbook.sheets[sheet.name] = convertSheet(sheet)
      superWorkbook.sheetOrder.push(sheet.name)
    }

    const output: NextSheetOutput = {
      _nextsheet: true,
      version: '0.1',
      name: workbook.name,
      workbookData: superWorkbook,
      buildAt: new Date().toISOString(),
    }

    return {
      mimeType: 'application/json',
      extension: 'json',
      data: JSON.stringify(output, null, 2),
    }
  }
}

export const superSheetAdapter = new SuperSheetAdapter()
