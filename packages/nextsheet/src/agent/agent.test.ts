import { describe, it, expect } from 'vitest'
import { wb, fromWorkbook, AgentError } from './builder.js'
import { validatePatch, validateWorkbook, validatePatches } from './validate.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function salesWorkbook() {
  return wb('Finances')
    .sheet('Sales', (s) => {
      s.column('region', 'string', { primary: true })
      s.column('units', 'number')
      s.column('revenue', 'currency', { currency: 'USD' })
      s.row(['LATAM', 4105, 775845])
      s.row(['APAC', 6870, 1435830])
    })
}

// ─── addSheet ─────────────────────────────────────────────────────────────────

describe('addSheet', () => {
  it('adds a new empty sheet', () => {
    const node = salesWorkbook().applyPatch({ op: 'addSheet', name: 'Costs' }).build()
    expect(node.sheets).toHaveLength(2)
    expect(node.sheets[1]!.name).toBe('Costs')
    expect(node.sheets[1]!.columns).toHaveLength(0)
  })

  it('throws SHEET_ALREADY_EXISTS when name is taken', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'addSheet', name: 'Sales' })
    ).toThrow(AgentError)
    expect(() =>
      salesWorkbook().applyPatch({ op: 'addSheet', name: 'Sales' })
    ).toThrow('SHEET_ALREADY_EXISTS')
  })
})

// ─── removeSheet ──────────────────────────────────────────────────────────────

describe('removeSheet', () => {
  it('removes the sheet', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'addSheet', name: 'Costs' })
      .applyPatch({ op: 'removeSheet', sheet: 'Costs' })
      .build()
    expect(node.sheets).toHaveLength(1)
    expect(node.sheets[0]!.name).toBe('Sales')
  })

  it('throws SHEET_NOT_FOUND for unknown sheet', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'removeSheet', sheet: 'Nope' })
    ).toThrow('SHEET_NOT_FOUND')
  })
})

// ─── renameSheet ──────────────────────────────────────────────────────────────

describe('renameSheet', () => {
  it('renames a sheet', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'renameSheet', sheet: 'Sales', newName: 'Q3 Sales' })
      .build()
    expect(node.sheets[0]!.name).toBe('Q3 Sales')
  })

  it('throws SHEET_NOT_FOUND for unknown sheet', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'renameSheet', sheet: 'Missing', newName: 'X' })
    ).toThrow('SHEET_NOT_FOUND')
  })

  it('throws SHEET_ALREADY_EXISTS if newName is taken', () => {
    const builder = salesWorkbook().applyPatch({ op: 'addSheet', name: 'Costs' })
    expect(() =>
      builder.applyPatch({ op: 'renameSheet', sheet: 'Sales', newName: 'Costs' })
    ).toThrow('SHEET_ALREADY_EXISTS')
  })
})

// ─── setHeader ────────────────────────────────────────────────────────────────

describe('setHeader', () => {
  it('sets title and subtitle', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'setHeader', sheet: 'Sales', title: 'Q3 Report', subtitle: 'FY2026' })
      .build()
    expect(node.sheets[0]!.header?.title).toBe('Q3 Report')
    expect(node.sheets[0]!.header?.subtitle).toBe('FY2026')
  })

  it('throws SHEET_NOT_FOUND for unknown sheet', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'setHeader', sheet: 'Nope', title: 'X' })
    ).toThrow('SHEET_NOT_FOUND')
  })
})

// ─── addColumn ────────────────────────────────────────────────────────────────

describe('addColumn', () => {
  it('appends a new column', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'addColumn', sheet: 'Sales', name: 'yoy', type: 'percent' })
      .build()
    const sheet = node.sheets[0]!
    expect(sheet.columns).toHaveLength(4)
    expect(sheet.columns[3]!.name).toBe('yoy')
    expect(sheet.columns[3]!.type).toBe('percent')
  })

  it('inserts at a specific index', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'addColumn', sheet: 'Sales', name: 'country', type: 'string', at: 1 })
      .build()
    expect(node.sheets[0]!.columns[1]!.name).toBe('country')
  })

  it('extends existing rows with null for the new column', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'addColumn', sheet: 'Sales', name: 'yoy', type: 'percent' })
      .build()
    node.sheets[0]!.rows.forEach((row) => {
      expect(row.cells).toHaveLength(4)
      expect(row.cells[3]!.value).toBeNull()
    })
  })

  it('throws SHEET_NOT_FOUND for unknown sheet', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'addColumn', sheet: 'Nope', name: 'x', type: 'string' })
    ).toThrow('SHEET_NOT_FOUND')
  })

  it('throws COLUMN_ALREADY_EXISTS for duplicate name', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'addColumn', sheet: 'Sales', name: 'units', type: 'number' })
    ).toThrow('COLUMN_ALREADY_EXISTS')
  })
})

// ─── removeColumn ─────────────────────────────────────────────────────────────

describe('removeColumn', () => {
  it('removes the column and its cells from all rows', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'removeColumn', sheet: 'Sales', column: 'units' })
      .build()
    const sheet = node.sheets[0]!
    expect(sheet.columns).toHaveLength(2)
    expect(sheet.columns.map((c) => c.name)).toEqual(['region', 'revenue'])
    sheet.rows.forEach((row) => expect(row.cells).toHaveLength(2))
  })

  it('throws SHEET_NOT_FOUND for unknown sheet', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'removeColumn', sheet: 'Nope', column: 'units' })
    ).toThrow('SHEET_NOT_FOUND')
  })

  it('throws COLUMN_NOT_FOUND for unknown column', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'removeColumn', sheet: 'Sales', column: 'missing' })
    ).toThrow('COLUMN_NOT_FOUND')
  })
})

// ─── updateColumn ─────────────────────────────────────────────────────────────

describe('updateColumn', () => {
  it('renames a column', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'updateColumn', sheet: 'Sales', column: 'units', updates: { name: 'qty' } })
      .build()
    expect(node.sheets[0]!.columns.map((c) => c.name)).toContain('qty')
    expect(node.sheets[0]!.columns.map((c) => c.name)).not.toContain('units')
  })

  it('changes type and adds currency', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'updateColumn', sheet: 'Sales', column: 'units', updates: { type: 'currency', currency: 'EUR' } })
      .build()
    const col = node.sheets[0]!.columns.find((c) => c.name === 'units')!
    expect(col.type).toBe('currency')
    expect(col.currency).toBe('EUR')
  })

  it('adds options list', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'updateColumn', sheet: 'Sales', column: 'region', updates: { options: ['NA', 'EU', 'APAC'] } })
      .build()
    expect(node.sheets[0]!.columns[0]!.options).toEqual(['NA', 'EU', 'APAC'])
  })

  it('throws SHEET_NOT_FOUND for unknown sheet', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'updateColumn', sheet: 'Nope', column: 'units', updates: { type: 'number' } })
    ).toThrow('SHEET_NOT_FOUND')
  })

  it('throws COLUMN_NOT_FOUND for unknown column', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'updateColumn', sheet: 'Sales', column: 'missing', updates: { type: 'number' } })
    ).toThrow('COLUMN_NOT_FOUND')
  })

  it('throws EMPTY_UPDATE for empty updates', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'updateColumn', sheet: 'Sales', column: 'units', updates: {} })
    ).toThrow('EMPTY_UPDATE')
  })

  it('throws COLUMN_ALREADY_EXISTS when renaming to existing name', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'updateColumn', sheet: 'Sales', column: 'units', updates: { name: 'region' } })
    ).toThrow('COLUMN_ALREADY_EXISTS')
  })
})

// ─── addRow ───────────────────────────────────────────────────────────────────

describe('addRow', () => {
  it('appends a row with values mapped to columns', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'addRow', sheet: 'Sales', values: { region: 'MEA', units: 1244, revenue: 247556 } })
      .build()
    const rows = node.sheets[0]!.rows
    expect(rows).toHaveLength(3)
    expect(rows[2]!.cells[0]!.value).toBe('MEA')
    expect(rows[2]!.cells[1]!.value).toBe(1244)
  })

  it('inserts at a specific index', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'addRow', sheet: 'Sales', values: { region: 'MEA', units: 0, revenue: 0 }, at: 0 })
      .build()
    expect(node.sheets[0]!.rows[0]!.cells[0]!.value).toBe('MEA')
  })

  it('fills null for missing values', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'addRow', sheet: 'Sales', values: { region: 'MEA' } })
      .build()
    const last = node.sheets[0]!.rows.at(-1)!
    expect(last.cells[1]!.value).toBeNull()
    expect(last.cells[2]!.value).toBeNull()
  })

  it('throws SHEET_NOT_FOUND for unknown sheet', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'addRow', sheet: 'Nope', values: {} })
    ).toThrow('SHEET_NOT_FOUND')
  })
})

// ─── updateCell ───────────────────────────────────────────────────────────────

describe('updateCell', () => {
  it('updates the value of a cell', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'updateCell', sheet: 'Sales', rowIndex: 0, column: 'revenue', value: 999999 })
      .build()
    expect(node.sheets[0]!.rows[0]!.cells[2]!.value).toBe(999999)
  })

  it('updates color and bold', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'updateCell', sheet: 'Sales', rowIndex: 1, column: 'units', value: 7000, color: 'green', bold: true })
      .build()
    const cell = node.sheets[0]!.rows[1]!.cells[1]!
    expect(cell.color).toBe('green')
    expect(cell.bold).toBe(true)
  })

  it('sets a formula on the cell', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'updateCell', sheet: 'Sales', rowIndex: 0, column: 'revenue', formula: '=units*price' })
      .build()
    expect(node.sheets[0]!.rows[0]!.cells[2]!.formula).toBe('=units*price')
  })

  it('sets a format on the cell', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'updateCell', sheet: 'Sales', rowIndex: 0, column: 'revenue', format: '#,##0.00' })
      .build()
    expect(node.sheets[0]!.rows[0]!.cells[2]!.format).toBe('#,##0.00')
  })

  it('can set formula and format without changing value', () => {
    const original = salesWorkbook().build()
    const node = salesWorkbook()
      .applyPatch({ op: 'updateCell', sheet: 'Sales', rowIndex: 0, column: 'revenue', formula: '=SUM(A1:A5)', format: '$#,##0' })
      .build()
    const cell = node.sheets[0]!.rows[0]!.cells[2]!
    expect(cell.formula).toBe('=SUM(A1:A5)')
    expect(cell.format).toBe('$#,##0')
    // value unchanged since we didn't pass `value`
    expect(cell.value).toBe(original.sheets[0]!.rows[0]!.cells[2]!.value)
  })

  it('throws SHEET_NOT_FOUND for unknown sheet', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'updateCell', sheet: 'Nope', rowIndex: 0, column: 'units', value: 0 })
    ).toThrow('SHEET_NOT_FOUND')
  })

  it('throws ROW_OUT_OF_BOUNDS for invalid rowIndex', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'updateCell', sheet: 'Sales', rowIndex: 99, column: 'units', value: 0 })
    ).toThrow('ROW_OUT_OF_BOUNDS')
  })

  it('throws COLUMN_NOT_FOUND for unknown column', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'updateCell', sheet: 'Sales', rowIndex: 0, column: 'missing', value: 0 })
    ).toThrow('COLUMN_NOT_FOUND')
  })
})

// ─── removeRow ────────────────────────────────────────────────────────────────

describe('removeRow', () => {
  it('removes the row at the given index', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'removeRow', sheet: 'Sales', rowIndex: 0 })
      .build()
    expect(node.sheets[0]!.rows).toHaveLength(1)
    expect(node.sheets[0]!.rows[0]!.cells[0]!.value).toBe('APAC')
  })

  it('throws SHEET_NOT_FOUND for unknown sheet', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'removeRow', sheet: 'Nope', rowIndex: 0 })
    ).toThrow('SHEET_NOT_FOUND')
  })

  it('throws ROW_OUT_OF_BOUNDS for invalid index', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'removeRow', sheet: 'Sales', rowIndex: 10 })
    ).toThrow('ROW_OUT_OF_BOUNDS')
  })
})

// ─── addChart ─────────────────────────────────────────────────────────────────

describe('addChart', () => {
  it('appends a chart to the sheet', () => {
    const node = salesWorkbook()
      .applyPatch({
        op: 'addChart',
        sheet: 'Sales',
        chart: {
          type: 'bar',
          title: 'Revenue by Region',
          xAxis: 'region',
          series: [{ kind: 'chart-series', name: 'Revenue', column: 'revenue' }],
        },
      })
      .build()
    expect(node.sheets[0]!.charts).toHaveLength(1)
    expect(node.sheets[0]!.charts[0]!.type).toBe('bar')
    expect(node.sheets[0]!.charts[0]!.title).toBe('Revenue by Region')
  })

  it('allows multiple charts', () => {
    const node = salesWorkbook()
      .applyPatch({ op: 'addChart', sheet: 'Sales', chart: { type: 'bar', series: [{ kind: 'chart-series', name: 'A' }] } })
      .applyPatch({ op: 'addChart', sheet: 'Sales', chart: { type: 'line', series: [{ kind: 'chart-series', name: 'B' }] } })
      .build()
    expect(node.sheets[0]!.charts).toHaveLength(2)
    expect(node.sheets[0]!.charts[1]!.type).toBe('line')
  })

  it('throws SHEET_NOT_FOUND for unknown sheet', () => {
    expect(() =>
      salesWorkbook().applyPatch({ op: 'addChart', sheet: 'Nope', chart: { type: 'bar', series: [] } })
    ).toThrow('SHEET_NOT_FOUND')
  })
})

// ─── fromWorkbook ─────────────────────────────────────────────────────────────

describe('fromWorkbook', () => {
  it('round-trips a WorkbookNode', () => {
    const original = salesWorkbook().build()
    const rebuilt = fromWorkbook(original).build()
    expect(rebuilt.name).toBe(original.name)
    expect(rebuilt.sheets).toHaveLength(original.sheets.length)
    expect(rebuilt.sheets[0]!.columns.map((c) => c.name)).toEqual(['region', 'units', 'revenue'])
    expect(rebuilt.sheets[0]!.rows).toHaveLength(2)
  })

  it('does not mutate the original node when patching', () => {
    const original = salesWorkbook().build()
    fromWorkbook(original).applyPatch({ op: 'addRow', sheet: 'Sales', values: { region: 'EU' } })
    expect(original.sheets[0]!.rows).toHaveLength(2)
  })

  it('can patch after loading', () => {
    const original = salesWorkbook().build()
    const updated = fromWorkbook(original)
      .applyPatch({ op: 'updateCell', sheet: 'Sales', rowIndex: 0, column: 'units', value: 9999 })
      .build()
    expect(updated.sheets[0]!.rows[0]!.cells[1]!.value).toBe(9999)
    expect(original.sheets[0]!.rows[0]!.cells[1]!.value).toBe(4105)
  })

  it('preserves header and pagination', () => {
    const original = wb('Test')
      .sheet('Data', (s) => {
        s.header('My Report', 'FY2026')
        s.paginate(10)
        s.column('id', 'number')
      })
      .build()
    const rebuilt = fromWorkbook(original).build()
    expect(rebuilt.sheets[0]!.header?.title).toBe('My Report')
    expect(rebuilt.sheets[0]!.pagination?.pageSize).toBe(10)
  })
})

// ─── validatePatch ────────────────────────────────────────────────────────────

describe('validatePatch', () => {
  it('passes a valid addRow patch', () => {
    const r = validatePatch({ op: 'addRow', sheet: 'Sales', values: { region: 'EU' } })
    expect(r.valid).toBe(true)
    expect(r.errors).toHaveLength(0)
  })

  it('passes a valid updateCell patch', () => {
    const r = validatePatch({ op: 'updateCell', sheet: 'Sales', rowIndex: 0, column: 'rev', value: 100, formula: '=A1*B1', format: '#,##0' })
    expect(r.valid).toBe(true)
  })

  it('passes a valid addChart patch', () => {
    const r = validatePatch({ op: 'addChart', sheet: 'Sales', chart: { type: 'bar', series: [{ name: 'Rev' }] } })
    expect(r.valid).toBe(true)
  })

  it('passes a valid removeSheet patch', () => {
    const r = validatePatch({ op: 'removeSheet', sheet: 'Sales' })
    expect(r.valid).toBe(true)
  })

  it('passes a valid updateColumn patch', () => {
    const r = validatePatch({ op: 'updateColumn', sheet: 'Sales', column: 'units', updates: { type: 'currency' } })
    expect(r.valid).toBe(true)
  })

  it('fails for unknown op', () => {
    const r = validatePatch({ op: 'deleteEverything' })
    expect(r.valid).toBe(false)
    expect(r.errors.length).toBeGreaterThan(0)
  })

  it('fails for missing required field', () => {
    const r = validatePatch({ op: 'addRow', values: { x: 1 } }) // missing sheet
    expect(r.valid).toBe(false)
    expect(r.errors.some((e) => e.includes('sheet'))).toBe(true)
  })

  it('fails for wrong type', () => {
    const r = validatePatch({ op: 'removeRow', sheet: 'Sales', rowIndex: 'zero' })
    expect(r.valid).toBe(false)
  })

  it('fails for non-object input', () => {
    expect(validatePatch(null).valid).toBe(false)
    expect(validatePatch('addRow').valid).toBe(false)
    expect(validatePatch(42).valid).toBe(false)
  })
})

// ─── validateWorkbook ─────────────────────────────────────────────────────────

describe('validateWorkbook', () => {
  it('passes a valid workbook structure', () => {
    const r = validateWorkbook({
      name: 'Q3',
      sheets: [{
        name: 'Sales',
        columns: [{ name: 'region', type: 'string' }],
        sections: [],
        rows: [{ cells: [{ value: 'APAC' }] }],
      }],
    })
    expect(r.valid).toBe(true)
  })

  it('fails when name is missing', () => {
    const r = validateWorkbook({ sheets: [] })
    expect(r.valid).toBe(false)
    expect(r.errors.some((e) => e.includes('name'))).toBe(true)
  })

  it('fails when sheets is not an array', () => {
    const r = validateWorkbook({ name: 'Q3', sheets: 'one' })
    expect(r.valid).toBe(false)
  })
})

// ─── validatePatches ──────────────────────────────────────────────────────────

describe('validatePatches', () => {
  it('passes an array of valid patches', () => {
    const r = validatePatches([
      { op: 'addRow', sheet: 'Sales', values: {} },
      { op: 'removeRow', sheet: 'Sales', rowIndex: 0 },
    ])
    expect(r.valid).toBe(true)
  })

  it('returns the index of the first invalid patch', () => {
    const r = validatePatches([
      { op: 'addRow', sheet: 'Sales', values: {} },
      { op: 'removeRow', sheet: 'Sales', rowIndex: 'bad' }, // invalid
    ])
    expect(r.valid).toBe(false)
    expect(r.index).toBe(1)
  })
})

// ─── AgentError ───────────────────────────────────────────────────────────────

describe('AgentError', () => {
  it('exposes code and op fields', () => {
    try {
      salesWorkbook().applyPatch({ op: 'removeRow', sheet: 'Sales', rowIndex: 99 })
    } catch (e) {
      expect(e).toBeInstanceOf(AgentError)
      expect((e as AgentError).code).toBe('ROW_OUT_OF_BOUNDS')
      expect((e as AgentError).op).toBe('removeRow')
    }
  })

  it('is catchable by name', () => {
    try {
      salesWorkbook().applyPatch({ op: 'addSheet', name: 'Sales' })
    } catch (e) {
      expect((e as Error).name).toBe('AgentError')
    }
  })
})
