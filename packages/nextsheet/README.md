# nextsheet

> The framework for the spreadsheet era.

Build spreadsheets as typed React-like components. One codebase compiles to CSV, Excel, Google Sheets, and any backend you need.

```bash
npm install nextsheet
# or
pnpm add nextsheet
```

---

## Quick start

### 1. Configure TypeScript

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "nextsheet"
  }
}
```

### 2. Write a sheet

```tsx
// Invoices.sheet.tsx
import { defineSheet, Sheet, Column, Formula } from 'nextsheet'

export default defineSheet('Invoices 2026', () => (
  <Sheet>
    <Column name="id"     type="number"   primary />
    <Column name="client" type="string"   required />
    <Column name="amount" type="currency" currency="USD" />
    <Column name="paid"   type="boolean"  default={false} />
    <Column name="total"  type="currency"
      formula={({ amount }) => <Formula>{amount} * 1.21</Formula>}
    />
  </Sheet>
))
```

### 3. Render it

```ts
import { workbook, csvAdapter, xlsxAdapter } from 'nextsheet'
import Invoices from './Invoices.sheet.js'

const wb = workbook('Finance 2026', [Invoices])

const csv  = await csvAdapter.render(wb)   // → string
const xlsx = await xlsxAdapter.render(wb)  // → Buffer
```

Or use the CLI:

```bash
npx nextsheet build Invoices.sheet.tsx --target xlsx --out dist/invoices.xlsx
npx nextsheet dev   Invoices.sheet.tsx   # live browser preview at localhost:3000
```

---

## Components

### Schema mode — `defineSheet` + `Column`

Best for structured data where each row follows the same shape.

```tsx
import { defineSheet, Sheet, Column, Formula } from 'nextsheet'

export default defineSheet('Products', () => (
  <Sheet>
    <Column name="sku"      type="string"   required />
    <Column name="price"    type="currency" currency="EUR" />
    <Column name="stock"    type="number" />
    <Column name="value"    type="currency"
      formula={({ price, stock }) => <Formula>{price} * {stock}</Formula>}
    />
  </Sheet>
))
```

**Column types:** `string` · `number` · `currency` · `boolean` · `date` · `percent`

### Report mode — function components

Best for dashboards, reports, and documents with mixed structure.

```tsx
import { Sheet, Header, Section, Row, Cell, useFormula, useQuery } from 'nextsheet'

const data = [
  { region: 'North', revenue: 520_000, growth: 0.12 },
  { region: 'South', revenue: 310_000, growth: 0.08 },
]

export default function SalesReport() {
  const total = useFormula(() => data.reduce((s, r) => s + r.revenue, 0))
  const top   = useQuery(data).orderBy('revenue', 'desc').first()

  return (
    <Sheet name="Sales Report">
      <Header title="Q1 Sales" subtitle="January — March 2026" />

      <Section title="By region">
        <Row header>
          <Cell>Region</Cell>
          <Cell>Revenue</Cell>
          <Cell>Growth</Cell>
        </Row>
        {data.map((r) => (
          <Row key={r.region}>
            <Cell>{r.region}</Cell>
            <Cell format="currency">{r.revenue}</Cell>
            <Cell format="percent" color={r.growth > 0 ? 'green' : 'red'}>
              {r.growth}
            </Cell>
          </Row>
        ))}
      </Section>

      <Section title="Summary">
        <Row><Cell bold>Total</Cell><Cell format="currency">{total}</Cell></Row>
        <Row><Cell bold>Top region</Cell><Cell>{top?.region}</Cell></Row>
      </Section>
    </Sheet>
  )
}
```

### Multi-sheet workbooks

```tsx
import { workbook, xlsxAdapter } from 'nextsheet'
import Invoices from './Invoices.sheet.js'
import Expenses from './Expenses.sheet.js'

const wb = workbook('Finance 2026', [Invoices, Expenses])
const { data } = await xlsxAdapter.render(wb)
```

---

## Hooks

```ts
import { useFormula, useQuery, useRange } from 'nextsheet'

// Evaluates JS at build time. Transpiles to native formulas in v0.2.
const total = useFormula(() => rows.reduce((s, r) => s + r.amount, 0))

// Chainable in-memory query.
const top = useQuery(sales)
  .where('region', 'North')
  .orderBy('amount', 'desc')
  .first()

// Live data from a connected backend. Available in v0.3.
const live = useRange<Row>('Sheet1!A2:D')
```

---

## Adapters

### Built-in adapters

```ts
import { csvAdapter, xlsxAdapter } from 'nextsheet'
import { superSheetAdapter } from 'nextsheet/adapters/supersheet'
```

| Adapter | Output | Status |
|---|---|---|
| `csvAdapter` | `.csv` string | ✅ |
| `xlsxAdapter` | `.xlsx` Buffer (via ExcelJS) | ✅ |
| `superSheetAdapter` | SuperSheet JSON | ✅ |
| Google Sheets | live sheet | ⏳ v0.3 |

### Custom adapters

Implement the `Adapter` interface to target any output:

```ts
import type { Adapter, WorkbookNode, RenderResult } from 'nextsheet'

export const myAdapter: Adapter = {
  name: 'my-adapter',

  async render(workbook: WorkbookNode): Promise<RenderResult> {
    for (const sheet of workbook.sheets) {
      for (const section of sheet.sections) {
        for (const row of section.rows) {
          for (const cell of row.cells) {
            // cell.value, cell.format, cell.bold, cell.color …
          }
        }
      }
    }
    return { mimeType: 'text/plain', extension: 'txt', data: '…' }
  },
}
```

---

## Cell formatting

```tsx
<Cell format="currency">1500</Cell>   // $1,500.00
<Cell format="percent">0.12</Cell>    // 12.00%
<Cell format="number">1234567</Cell>  // 1,234,567
<Cell bold>Label</Cell>
<Cell color="green">+12%</Cell>       // red · green · blue · yellow · orange · purple · gray · #hex
<Cell colspan={3}>Merged</Cell>
```

---

## IR types

NextSheet compiles JSX to a plain IR (intermediate representation) — no virtual DOM, no reconciler.

```
WorkbookNode
  └── SheetNode[]
        ├── columns: ColumnNode[]
        ├── header?: HeaderNode
        ├── sections: SectionNode[]
        │     └── rows: RowNode[]
        │           └── cells: CellNode[]
        └── rows: RowNode[]
```

All types are exported:

```ts
import type {
  WorkbookNode, SheetNode, SectionNode, RowNode, CellNode,
  ColumnNode, HeaderNode, FormulaNode, SheetDefinition, Adapter, RenderResult,
} from 'nextsheet'
```

---

## How it works

NextSheet ships a custom JSX runtime (`jsxImportSource: "nextsheet"`). When TypeScript compiles your `.sheet.tsx`, each JSX element calls `jsx(Component, props)` which immediately invokes the component function. There is no virtual DOM. Components are pure functions that return IR nodes. The adapter consumes the IR.

This means NextSheet has zero runtime overhead — there is nothing to mount, diff, or reconcile. A sheet is just a function call.

---

## License

MIT — [nextsheet/nextsheet](https://github.com/nextsheet/nextsheet)
