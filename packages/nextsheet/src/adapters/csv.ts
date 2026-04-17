import type { CellNode, RenderResult, RowNode, SectionNode, SheetNode, WorkbookNode } from '../types.js'
import { BaseAdapter } from './base.js'

function escapeCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value)
  // RFC 4180: quote cells that contain commas, quotes, or newlines
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function cellValue(cell: CellNode): string {
  if (cell.formula !== undefined) return ''  // CSV cannot represent formulas
  return escapeCell(cell.value)
}

function rowToCSV(row: RowNode): string {
  return row.cells.map(cellValue).join(',')
}

function rowsFromSection(section: SectionNode, includeSectionTitle: boolean): RowNode[] {
  if (includeSectionTitle && section.title !== undefined) {
    const titleRow: RowNode = {
      kind: 'row',
      cells: [{ kind: 'cell', value: section.title, bold: true }],
    }
    return [titleRow, ...section.rows]
  }
  return section.rows
}

function sheetToCSV(sheet: SheetNode, options: CsvAdapterOptions): string {
  const lines: string[] = []

  // Header block
  if (sheet.header !== undefined && !options.omitSheetHeaders) {
    lines.push(escapeCell(sheet.header.title))
    if (sheet.header.subtitle !== undefined) {
      lines.push(escapeCell(sheet.header.subtitle))
    }
    lines.push('')
  }

  // Schema-mode: columns define headers
  if (sheet.columns.length > 0) {
    const nonFormulaColumns = sheet.columns.filter((c) => c.formula === undefined)
    lines.push(nonFormulaColumns.map((c) => escapeCell(c.name)).join(','))
  }

  // Sections
  for (const section of sheet.sections) {
    const sectionRows = rowsFromSection(section, !options.omitSectionTitles)
    for (const row of sectionRows) {
      lines.push(rowToCSV(row))
    }
  }

  // Direct rows under Sheet
  for (const row of sheet.rows) {
    lines.push(rowToCSV(row))
  }

  return lines.join('\n')
}

export interface CsvAdapterOptions {
  /** Skip title/subtitle header block at top of each sheet. */
  readonly omitSheetHeaders?: boolean
  /** Skip section title rows. */
  readonly omitSectionTitles?: boolean
  /** Line ending: 'lf' (default) or 'crlf' (RFC 4180). */
  readonly lineEnding?: 'lf' | 'crlf'
}

export class CsvAdapter extends BaseAdapter {
  readonly name = 'csv'

  constructor(private readonly options: CsvAdapterOptions = {}) {
    super()
  }

  async render(workbook: WorkbookNode): Promise<RenderResult> {
    const { lineEnding = 'lf' } = this.options
    const eol = lineEnding === 'crlf' ? '\r\n' : '\n'

    const parts = workbook.sheets.map((sheet) => {
      const csv = sheetToCSV(sheet, this.options)
      return lineEnding === 'crlf' ? csv.replace(/\n/g, eol) : csv
    })

    // Multiple sheets → separate them with a blank line + sheet name comment
    const combined =
      workbook.sheets.length === 1
        ? parts[0]!
        : workbook.sheets
            .map((sheet, i) => `# ${sheet.name}${eol}${parts[i]!}`)
            .join(eol + eol)

    return {
      mimeType: 'text/csv',
      extension: 'csv',
      data: combined,
    }
  }
}

export const csvAdapter = new CsvAdapter()
