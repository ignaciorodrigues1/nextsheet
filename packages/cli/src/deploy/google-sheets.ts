import type { WorkbookNode, SheetNode, ColumnNode, RowNode } from 'nextsheet'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function colLetter(n: number): string {
  let r = ''
  let i = n
  while (i >= 0) {
    r = String.fromCharCode(65 + (i % 26)) + r
    i = Math.floor(i / 26) - 1
  }
  return r
}

/**
 * Translate a column-formula expression to a Sheets cell reference.
 * Same logic as the xlsx adapter: replaces column names with letter+row.
 * e.g. columns=[Name,Amount,Tax], rowIndex=3, expr="Amount * 0.21" → "B3 * 0.21"
 */
function translateFormula(expr: string, columns: ColumnNode[], rowIndex: number): string {
  let result = expr
  columns.forEach((col, i) => {
    result = result.replace(
      new RegExp(`\\b${col.name}\\b`, 'g'),
      `${colLetter(i)}${rowIndex}`
    )
  })
  return result
}

type CellValue = string | number | boolean | null

function sheetToMatrix(sheet: SheetNode): CellValue[][] {
  const rows: CellValue[][] = []

  // Header row from column definitions (row 1)
  if (sheet.columns.length > 0) {
    rows.push(sheet.columns.map((c) => c.name))
  }

  // headerRow occupies row 1; data starts at row 2
  const dataRowOffset = rows.length + 1

  const pushRow = (row: RowNode, dataIndex: number): void => {
    if (row.header) return
    const rowIndex = dataRowOffset + dataIndex
    rows.push(
      row.cells.map((c) => {
        if (c.formula) {
          // Prepend = and translate column-name refs to cell addresses
          return `=${translateFormula(c.formula, sheet.columns, rowIndex)}`
        }
        if (c.value === undefined) return null
        return c.value as CellValue
      })
    )
  }

  let dataIndex = 0
  for (const section of sheet.sections) {
    for (const row of section.rows) {
      pushRow(row, dataIndex++)
    }
  }
  for (const row of sheet.rows) {
    pushRow(row, dataIndex++)
  }

  return rows
}

// ─── Formatting request builders ──────────────────────────────────────────────

interface GridRange {
  sheetId: number
  startRowIndex: number
  endRowIndex: number
  startColumnIndex: number
  endColumnIndex: number
}

function headerFormatRequest(sheetId: number, colCount: number) {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: colCount,
      } satisfies GridRange,
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true },
          backgroundColor: { red: 0.878, green: 0.878, blue: 0.878 },
        },
      },
      fields: 'userEnteredFormat(textFormat,backgroundColor)',
    },
  }
}

function columnFormatRequest(
  sheetId: number,
  colIndex: number,
  rowCount: number,
  pattern: string
) {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1, // skip header
        endRowIndex: rowCount,
        startColumnIndex: colIndex,
        endColumnIndex: colIndex + 1,
      } satisfies GridRange,
      cell: {
        userEnteredFormat: { numberFormat: { type: 'NUMBER', pattern } },
      },
      fields: 'userEnteredFormat.numberFormat',
    },
  }
}

function freezeHeaderRequest(sheetId: number) {
  return {
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
      fields: 'gridProperties.frozenRowCount',
    },
  }
}

function buildFormatRequests(
  sheet: SheetNode,
  sheetId: number,
  totalRows: number
): object[] {
  const requests: object[] = []

  if (sheet.columns.length > 0) {
    requests.push(headerFormatRequest(sheetId, sheet.columns.length))
    requests.push(freezeHeaderRequest(sheetId))

    sheet.columns.forEach((col, i) => {
      let pattern: string | undefined
      if (col.type === 'currency') {
        const sym = col.currency === 'EUR' ? '€' : col.currency === 'GBP' ? '£' : '$'
        pattern = `${sym}#,##0.00`
      } else if (col.type === 'percent') {
        pattern = '0.00%'
      } else if (col.type === 'date') {
        pattern = 'yyyy-mm-dd'
      }
      if (pattern) {
        requests.push(columnFormatRequest(sheetId, i, totalRows, pattern))
      }
    })
  }

  return requests
}

// ─── Deploy ───────────────────────────────────────────────────────────────────

interface BatchUpdateData {
  range: string
  values: CellValue[][]
}

export interface GoogleSheetsDeployResult {
  spreadsheetId: string
  url: string
}

export async function deployToGoogleSheets(
  wb: WorkbookNode,
  opts: {
    token: string
    spreadsheetId?: string
    name?: string
  }
): Promise<GoogleSheetsDeployResult> {
  const { token } = opts
  const jsonHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  let spreadsheetId = opts.spreadsheetId
  // sheetId (integer) per sheet name, populated from create or set to defaults
  const sheetIdMap = new Map<string, number>()

  if (!spreadsheetId) {
    // Create spreadsheet — each sheet gets an auto-assigned sheetId
    const body = {
      properties: { title: opts.name ?? wb.name },
      sheets: wb.sheets.map((s, i) => ({
        properties: { sheetId: i, title: s.name },
      })),
    }
    const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      throw new Error(`Failed to create spreadsheet: ${res.status} ${await res.text()}`)
    }
    const created = (await res.json()) as {
      spreadsheetId: string
      sheets: Array<{ properties: { sheetId: number; title: string } }>
    }
    spreadsheetId = created.spreadsheetId
    for (const s of created.sheets) {
      sheetIdMap.set(s.properties.title, s.properties.sheetId)
    }
  } else {
    // Fetch existing sheet IDs
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) {
      throw new Error(`Failed to fetch spreadsheet metadata: ${res.status} ${await res.text()}`)
    }
    const meta = (await res.json()) as {
      sheets: Array<{ properties: { sheetId: number; title: string } }>
    }
    for (const s of meta.sheets) {
      sheetIdMap.set(s.properties.title, s.properties.sheetId)
    }
  }

  // ── Write values ──────────────────────────────────────────────────────────
  const batchData: BatchUpdateData[] = []
  for (const sheet of wb.sheets) {
    const matrix = sheetToMatrix(sheet)
    if (matrix.length === 0) continue
    const maxCols = Math.max(...matrix.map((r) => r.length))
    batchData.push({
      range: `'${sheet.name}'!A1:${colLetter(maxCols - 1)}${matrix.length}`,
      values: matrix,
    })
  }

  if (batchData.length > 0) {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: batchData }),
      }
    )
    if (!res.ok) {
      throw new Error(`Failed to write values: ${res.status} ${await res.text()}`)
    }
  }

  // ── Apply formatting ──────────────────────────────────────────────────────
  const formatRequests: object[] = []
  for (const sheet of wb.sheets) {
    const sheetId = sheetIdMap.get(sheet.name)
    if (sheetId === undefined) continue
    const matrix = sheetToMatrix(sheet)
    formatRequests.push(...buildFormatRequests(sheet, sheetId, matrix.length))
  }

  if (formatRequests.length > 0) {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ requests: formatRequests }),
      }
    )
    if (!res.ok) {
      throw new Error(`Failed to apply formatting: ${res.status} ${await res.text()}`)
    }
  }

  return {
    spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  }
}
