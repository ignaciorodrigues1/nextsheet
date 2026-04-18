/**
 * XLSX adapter — generates real .xlsx workbooks via ExcelJS.
 * Targets NextSheet v0.2. Basic column/row/cell output is functional now;
 * formula translation and rich styling ship in v0.2.
 */

import type { CellNode, ColumnNode, RenderResult, RowNode, SheetNode, WorkbookNode } from '../types.js'
import { getActiveConfig, type NextSheetTheme } from '../config.js'
import { BaseAdapter } from './base.js'

// Lazy import so exceljs is only loaded when the xlsx adapter is actually used.
async function loadExcelJS() {
  const { default: ExcelJS } = await import('exceljs')
  return ExcelJS
}

function hexToArgb(hex: string): string {
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    const [r, g, b] = clean
    return `FF${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  return `FF${clean.toUpperCase()}`
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
  columns: ColumnNode[],
  theme?: NextSheetTheme
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

  // Base font from theme
  if (theme?.typography?.fontFamily !== undefined || theme?.typography?.fontSize !== undefined) {
    wsCell.font = {
      ...(theme.typography?.fontFamily !== undefined ? { name: theme.typography.fontFamily } : {}),
      ...(theme.typography?.fontSize !== undefined   ? { size: theme.typography.fontSize }   : {}),
    }
  }

  if (cell.bold === true) wsCell.font = { ...wsCell.font, bold: true }

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
    wsCell.font = { ...wsCell.font, color: { argb } }
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
  columns: ColumnNode[],
  theme?: NextSheetTheme
): void {
  const wsRow = ws.getRow(rowIndex)
  row.cells.forEach((cell, colIndex) => {
    const wsCell = wsRow.getCell(colIndex + 1)
    applyCell(wsCell, cell, rowIndex, colIndex, columns, theme)
  })
  if (row.header === true) {
    const headerBg = theme?.colors?.primary !== undefined
      ? hexToArgb(theme.colors.primary)
      : 'FFE0E0E0'
    const headerFg = theme?.colors?.headerText !== undefined
      ? hexToArgb(theme.colors.headerText)
      : undefined
    wsRow.eachCell((cell) => {
      cell.font = {
        ...(cell.font ?? {}),
        bold: true,
        ...(headerFg !== undefined ? { color: { argb: headerFg } } : {}),
      }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBg } }
    })
  }
  wsRow.commit()
}

async function renderSheet(
  wb: import('exceljs').Workbook,
  sheet: SheetNode,
  theme?: NextSheetTheme
): Promise<void> {
  const ws = wb.addWorksheet(sheet.name)
  let rowIndex = 1
  const colWidth = theme?.sheet?.columnWidth ?? 16
  const headerFontSize = theme?.typography?.headerFontSize ?? 14
  const baseFontName = theme?.typography?.fontFamily
  const baseFontSize = theme?.typography?.fontSize

  if (sheet.header !== undefined) {
    const titleRow = ws.getRow(rowIndex++)
    titleRow.getCell(1).value = sheet.header.title
    titleRow.getCell(1).font = {
      bold: true,
      size: headerFontSize,
      ...(baseFontName !== undefined ? { name: baseFontName } : {}),
    }
    titleRow.commit()

    if (sheet.header.subtitle !== undefined) {
      const subtitleRow = ws.getRow(rowIndex++)
      subtitleRow.getCell(1).value = sheet.header.subtitle
      subtitleRow.getCell(1).font = {
        ...(baseFontName !== undefined ? { name: baseFontName } : {}),
        ...(baseFontSize !== undefined ? { size: baseFontSize } : {}),
      }
      subtitleRow.commit()
    }
    rowIndex++ // blank separator row
  }

  if (sheet.columns.length > 0) {
    ws.columns = sheet.columns.map((col) => ({
      header: col.name,
      key: col.name,
      width: colWidth,
    }))
    const colHeaderBg = theme?.colors?.primary !== undefined
      ? hexToArgb(theme.colors.primary)
      : 'FFD0D0D0'
    const colHeaderFg = theme?.colors?.headerText !== undefined
      ? hexToArgb(theme.colors.headerText)
      : undefined
    const headerRow = ws.getRow(rowIndex++)
    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        ...(baseFontName !== undefined ? { name: baseFontName } : {}),
        ...(baseFontSize !== undefined ? { size: baseFontSize } : {}),
        ...(colHeaderFg !== undefined ? { color: { argb: colHeaderFg } } : {}),
      }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colHeaderBg } }
    })
    headerRow.commit()
  }

  for (const section of sheet.sections) {
    if (section.title !== undefined) {
      const titleRow = ws.getRow(rowIndex++)
      titleRow.getCell(1).value = section.title
      titleRow.getCell(1).font = {
        bold: true,
        ...(baseFontName !== undefined ? { name: baseFontName } : {}),
        ...(baseFontSize !== undefined ? { size: baseFontSize } : {}),
      }
      titleRow.commit()
    }
    for (const row of section.rows) {
      applyRow(ws, row, rowIndex++, sheet.columns, theme)
    }
  }

  for (const row of sheet.rows) {
    applyRow(ws, row, rowIndex++, sheet.columns, theme)
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

    const theme = getActiveConfig().theme

    for (const sheet of workbook.sheets) {
      await renderSheet(wb, sheet, theme)
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
