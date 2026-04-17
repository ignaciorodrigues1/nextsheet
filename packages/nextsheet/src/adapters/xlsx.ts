/**
 * XLSX adapter — generates real .xlsx workbooks via ExcelJS.
 * Targets NextSheet v0.2. Basic column/row/cell output is functional now;
 * formula translation and rich styling ship in v0.2.
 */

import type { CellNode, ColumnNode, RenderResult, RowNode, SheetNode, WorkbookNode } from '../types.js'
import { BaseAdapter } from './base.js'

// Lazy import so exceljs is only loaded when the xlsx adapter is actually used.
async function loadExcelJS() {
  const { default: ExcelJS } = await import('exceljs')
  return ExcelJS
}

function columnLetter(index: number): string {
  let letter = ''
  let n = index + 1
  while (n > 0) {
    const rem = (n - 1) % 26
    letter = String.fromCharCode(65 + rem) + letter
    n = Math.floor((n - 1) / 26)
  }
  return letter
}

function applyCell(
  wsCell: import('exceljs').Cell,
  cell: CellNode,
  rowIndex: number,
  colIndex: number,
  columns: ColumnNode[]
): void {
  if (cell.formula !== undefined) {
    // Translate column-name refs to column-letter refs for this row.
    // e.g. "amount * 1.21" → "C2 * 1.21"
    let formula = cell.formula
    columns.forEach((col, i) => {
      const letter = columnLetter(i)
      formula = formula!.replace(new RegExp(`\\b${col.name}\\b`, 'g'), `${letter}${rowIndex}`)
    })
    wsCell.value = { formula }
  } else {
    wsCell.value = cell.value as import('exceljs').CellValue
  }

  if (cell.bold === true) wsCell.font = { bold: true }

  if (cell.color !== undefined) {
    const colorMap: Record<string, string> = {
      red: 'FFFF0000',
      green: 'FF00AA00',
      blue: 'FF0000FF',
      yellow: 'FFFFFF00',
      orange: 'FFFF8800',
      purple: 'FF8800FF',
      gray: 'FF888888',
    }
    const argb = colorMap[cell.color] ?? `FF${cell.color.replace('#', '')}`
    wsCell.font = { ...(wsCell.font ?? {}), color: { argb } }
  }

  const col = columns[colIndex]
  const format = cell.format ?? col?.format
  const colType = col?.type

  if (format === 'currency' || colType === 'currency') {
    const currency = col?.currency ?? 'USD'
    wsCell.numFmt = currency === 'USD' ? '$#,##0.00' : '#,##0.00'
  } else if (format === 'percent' || colType === 'percent') {
    wsCell.numFmt = '0.00%'
  } else if (format === 'date' || colType === 'date') {
    wsCell.numFmt = 'yyyy-mm-dd'
  }
}

function applyRow(
  ws: import('exceljs').Worksheet,
  row: RowNode,
  rowIndex: number,
  columns: ColumnNode[]
): void {
  const wsRow = ws.getRow(rowIndex)
  row.cells.forEach((cell, colIndex) => {
    const wsCell = wsRow.getCell(colIndex + 1)
    applyCell(wsCell, cell, rowIndex, colIndex, columns)
  })
  if (row.header === true) {
    wsRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      }
    })
  }
  wsRow.commit()
}

async function renderSheet(
  wb: import('exceljs').Workbook,
  sheet: SheetNode
): Promise<void> {
  const ws = wb.addWorksheet(sheet.name)
  let rowIndex = 1

  if (sheet.header !== undefined) {
    const titleRow = ws.getRow(rowIndex++)
    titleRow.getCell(1).value = sheet.header.title
    titleRow.getCell(1).font = { bold: true, size: 14 }
    titleRow.commit()

    if (sheet.header.subtitle !== undefined) {
      const subtitleRow = ws.getRow(rowIndex++)
      subtitleRow.getCell(1).value = sheet.header.subtitle
      subtitleRow.commit()
    }
    rowIndex++ // blank separator row
  }

  if (sheet.columns.length > 0) {
    ws.columns = sheet.columns.map((col) => ({
      header: col.name,
      key: col.name,
      width: 16,
    }))
    const headerRow = ws.getRow(rowIndex++)
    headerRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD0D0D0' } }
    })
    headerRow.commit()
  }

  for (const section of sheet.sections) {
    if (section.title !== undefined) {
      const titleRow = ws.getRow(rowIndex++)
      titleRow.getCell(1).value = section.title
      titleRow.getCell(1).font = { bold: true }
      titleRow.commit()
    }
    for (const row of section.rows) {
      applyRow(ws, row, rowIndex++, sheet.columns)
    }
  }

  for (const row of sheet.rows) {
    applyRow(ws, row, rowIndex++, sheet.columns)
  }
}

export interface XlsxAdapterOptions {
  /** Creator metadata embedded in the workbook. */
  readonly creator?: string
}

export class XlsxAdapter extends BaseAdapter {
  readonly name = 'xlsx'

  constructor(private readonly options: XlsxAdapterOptions = {}) {
    super()
  }

  async render(workbook: WorkbookNode): Promise<RenderResult> {
    const ExcelJS = await loadExcelJS()
    const wb = new ExcelJS.Workbook()

    wb.creator = this.options.creator ?? 'NextSheet'
    wb.created = new Date()

    for (const sheet of workbook.sheets) {
      await renderSheet(wb, sheet)
    }

    const buffer = await wb.xlsx.writeBuffer()

    return {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx',
      data: Buffer.from(buffer),
    }
  }
}

export const xlsxAdapter = new XlsxAdapter()
