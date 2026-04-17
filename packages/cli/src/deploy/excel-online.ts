import type { WorkbookNode, SheetNode, RowNode } from 'nextsheet'

function colLetter(n: number): string {
  let r = ''
  let i = n
  while (i >= 0) {
    r = String.fromCharCode(65 + (i % 26)) + r
    i = Math.floor(i / 26) - 1
  }
  return r
}

type CellValue = string | number | boolean | null

function sheetToMatrix(sheet: SheetNode): CellValue[][] {
  const rows: CellValue[][] = []

  if (sheet.columns.length > 0) {
    rows.push(sheet.columns.map((c) => c.name))
  }

  const pushRow = (row: RowNode): void => {
    if (row.header) return
    rows.push(row.cells.map((c) => (c.value === undefined ? null : (c.value as CellValue))))
  }

  for (const section of sheet.sections) {
    for (const row of section.rows) pushRow(row)
  }
  for (const row of sheet.rows) pushRow(row)

  return rows
}

export interface ExcelOnlineDeployResult {
  driveItemId: string
  url: string
}

export async function deployToExcelOnline(
  wb: WorkbookNode,
  opts: {
    accessToken: string
    /** Existing OneDrive item ID to overwrite. If omitted, creates a new file. */
    driveItemId?: string
    /** File name (without .xlsx) used when creating a new file. */
    fileName?: string
  }
): Promise<ExcelOnlineDeployResult> {
  const { accessToken } = opts
  const bearer = { Authorization: `Bearer ${accessToken}` }

  // ── Create file via xlsx adapter if no driveItemId provided ───────────────
  if (!opts.driveItemId) {
    const { xlsxAdapter } = await import('nextsheet/adapters/xlsx')
    const rendered = await xlsxAdapter.render(wb)
    const fileName = `${opts.fileName ?? wb.name}.xlsx`

    const uploadRes = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURIComponent(fileName)}:/content`,
      {
        method: 'PUT',
        headers: {
          ...bearer,
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        body: rendered.data as Buffer,
      }
    )
    if (!uploadRes.ok) {
      throw new Error(`Failed to create Excel file: ${uploadRes.status} ${await uploadRes.text()}`)
    }
    const created = (await uploadRes.json()) as { id: string; webUrl: string }
    return { driveItemId: created.id, url: created.webUrl }
  }

  // ── Update existing file — write each sheet's range via Graph API ─────────
  const { driveItemId } = opts
  const jsonHeaders = { ...bearer, 'Content-Type': 'application/json' }

  for (const sheet of wb.sheets) {
    const matrix = sheetToMatrix(sheet)
    if (matrix.length === 0) continue

    const maxCols = Math.max(...matrix.map((r) => r.length))
    const range = `A1:${colLetter(maxCols - 1)}${matrix.length}`

    const res = await fetch(
      [
        'https://graph.microsoft.com/v1.0/me/drive/items',
        driveItemId,
        'workbook/worksheets',
        encodeURIComponent(sheet.name),
        `range(address='${encodeURIComponent(range)}')`,
      ].join('/'),
      {
        method: 'PATCH',
        headers: jsonHeaders,
        body: JSON.stringify({ values: matrix }),
      }
    )
    if (!res.ok) {
      throw new Error(
        `Failed to write sheet "${sheet.name}": ${res.status} ${await res.text()}`
      )
    }
  }

  // Fetch the webUrl of the updated file
  const itemRes = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${driveItemId}?$select=id,webUrl`,
    { headers: bearer }
  )
  const item = (await itemRes.json()) as { id: string; webUrl: string }
  return { driveItemId: item.id, url: item.webUrl }
}
