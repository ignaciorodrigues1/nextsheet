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

## Charts

`<Chart>` and `<ChartSeries>` are first-class sheet components. Place them anywhere inside `<Sheet>` — after sections, after columns, or mixed in between.

In dev mode (`nextsheet dev`) charts render as interactive Chart.js visualizations in the browser preview. The `charts` array is available on every `SheetNode` so custom adapters can produce native chart output.

### Basic example

```tsx
import { Sheet, Column, Section, Row, Cell, Chart, ChartSeries } from 'nextsheet'

const months   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const revenue  = [42_000, 58_000, 51_000, 67_000, 73_000, 88_000]
const expenses = [28_000, 33_000, 30_000, 38_000, 41_000, 45_000]

export default function Dashboard() {
  return (
    <Sheet name="Dashboard">
      <Column name="Month"    type="string"   primary />
      <Column name="Revenue"  type="currency" />
      <Column name="Expenses" type="currency" />

      <Section>
        {months.map((m, i) => (
          <Row key={m}>
            <Cell>{m}</Cell>
            <Cell>{revenue[i]}</Cell>
            <Cell>{expenses[i]}</Cell>
          </Row>
        ))}
      </Section>

      {/* Series pull values from the columns above automatically */}
      <Chart type="bar" title="Revenue vs Expenses" xAxis="Month">
        <ChartSeries name="Revenue"  column="Revenue"  color="#22c55e" />
        <ChartSeries name="Expenses" column="Expenses" color="#ef4444" />
      </Chart>
    </Sheet>
  )
}
```

---

### Chart types

| `type` | Description |
|---|---|
| `bar` | Vertical grouped bars |
| `horizontal-bar` | Horizontal bars — good for rankings |
| `line` | Line with data points |
| `area` | Filled line |
| `stacked-bar` | Bars stacked on top of each other |
| `stacked-area` | Stacked filled lines — good for composition over time |
| `pie` | Circular slices |
| `donut` | Pie with hollow center |
| `scatter` | Points at (x, y) coordinates |
| `bubble` | Points with variable radius (x, y, r) |
| `radar` | Spider chart — good for multi-axis comparison |

---

### `<Chart>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `ChartType` | required | Chart type from the table above |
| `title` | `string` | — | Title displayed above the chart |
| `xAxis` | `string` | — | Column name to use as x-axis / category labels |
| `showLegend` | `boolean` | `true` | Show or hide the series legend |
| `height` | `number` | `320` | Canvas height in pixels |
| `width` | `number` | — | Max canvas width in pixels |

### `<ChartSeries>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | required | Label shown in the legend and tooltips |
| `column` | `string` | — | Column name in the sheet to read values from |
| `data` | `number[]` | — | Inline numeric array — used when `column` is not set |
| `points` | `ChartPoint[]` | — | Explicit `{x, y, r?}` points for `scatter` / `bubble` |
| `color` | `string` | auto | Hex color (`#3b82f6`) or CSS color name |

`ChartPoint` is `{ x: number; y: number; r?: number }`.

---

### Data sources

**Column reference** — reads values from the sheet rows at render time:

```tsx
<ChartSeries name="Revenue" column="Revenue" />
```

**Inline array** — hardcoded values, no columns required:

```tsx
<ChartSeries name="Forecast" data={[55_000, 62_000, 70_000, 80_000]} />
```

**Point array** — for `scatter` and `bubble` charts:

```tsx
<ChartSeries name="Products" points={[
  { x: 10, y: 4.2 },
  { x: 25, y: 3.8, r: 10 },
  { x: 50, y: 4.7, r: 6 },
]} />
```

---

### One example per type

```tsx
{/* Bar — grouped vertical bars */}
<Chart type="bar" title="Sales by Quarter" xAxis="Quarter">
  <ChartSeries name="2024" column="Sales2024" color="#3b82f6" />
  <ChartSeries name="2025" column="Sales2025" color="#22c55e" />
</Chart>

{/* Horizontal bar — useful for category rankings */}
<Chart type="horizontal-bar" title="Revenue by Region" xAxis="Region">
  <ChartSeries name="Revenue" column="Revenue" />
</Chart>

{/* Line — trend over time */}
<Chart type="line" title="Monthly Active Users">
  <ChartSeries name="MAU" data={[1_200, 1_800, 2_400, 3_100, 3_900]} />
</Chart>

{/* Area — same as line but filled */}
<Chart type="area" title="Cumulative Revenue" xAxis="Month">
  <ChartSeries name="Revenue" column="Revenue" color="#6366f1" />
</Chart>

{/* Stacked bar — composition of parts */}
<Chart type="stacked-bar" title="Cost Breakdown" xAxis="Month">
  <ChartSeries name="Engineering" column="Engineering" color="#3b82f6" />
  <ChartSeries name="Marketing"   column="Marketing"   color="#f97316" />
  <ChartSeries name="Operations"  column="Operations"  color="#a855f7" />
</Chart>

{/* Stacked area — share over time */}
<Chart type="stacked-area" title="Traffic by Channel" xAxis="Week">
  <ChartSeries name="Organic"  column="Organic"  color="#22c55e" />
  <ChartSeries name="Paid"     column="Paid"     color="#3b82f6" />
  <ChartSeries name="Referral" column="Referral" color="#f97316" />
</Chart>

{/* Pie — part-of-whole */}
<Chart type="pie" title="Market Share" xAxis="Company">
  <ChartSeries name="Share" column="Share" />
</Chart>

{/* Donut — same as pie with hollow center */}
<Chart type="donut" title="Budget Allocation" xAxis="Category">
  <ChartSeries name="Allocation" column="Budget" />
</Chart>

{/* Scatter — two-variable correlation */}
<Chart type="scatter" title="Price vs Rating">
  <ChartSeries name="Products" points={[
    { x: 10, y: 4.2 }, { x: 25, y: 3.8 },
    { x: 50, y: 4.7 }, { x: 80, y: 4.1 },
  ]} />
</Chart>

{/* Bubble — three-variable comparison (r = bubble radius) */}
<Chart type="bubble" title="Revenue / Margin / Volume">
  <ChartSeries name="Products" points={[
    { x: 20, y: 30, r: 5  },
    { x: 40, y: 55, r: 12 },
    { x: 60, y: 40, r: 8  },
    { x: 80, y: 70, r: 16 },
  ]} />
</Chart>

{/* Radar — multi-axis comparison */}
<Chart type="radar" title="Skill Assessment">
  <ChartSeries name="Alice" data={[85, 92, 78, 95, 80]} color="#3b82f6" />
  <ChartSeries name="Bob"   data={[70, 85, 90, 75, 88]} color="#ef4444" />
</Chart>
```

### Multiple charts in one sheet

A sheet can have any number of charts. Each renders below the data table in the dev preview:

```tsx
<Sheet name="Sales Dashboard">
  <Column name="Month"   type="string" />
  <Column name="Revenue" type="currency" />
  <Column name="Units"   type="number" />

  <Section>{/* rows … */}</Section>

  <Chart type="bar" title="Monthly Revenue" xAxis="Month">
    <ChartSeries name="Revenue" column="Revenue" color="#22c55e" />
  </Chart>

  <Chart type="line" title="Units Sold" xAxis="Month" showLegend={false}>
    <ChartSeries name="Units" column="Units" color="#3b82f6" />
  </Chart>
</Sheet>
```

### Accessing charts in a custom adapter

```ts
import type { Adapter, WorkbookNode, RenderResult } from 'nextsheet'

export const myAdapter: Adapter = {
  name: 'my-adapter',
  async render(workbook: WorkbookNode): Promise<RenderResult> {
    for (const sheet of workbook.sheets) {
      for (const chart of sheet.charts) {
        console.log(chart.type, chart.title)
        for (const series of chart.series) {
          console.log(series.name, series.column, series.data)
        }
      }
    }
    return { mimeType: 'text/plain', extension: 'txt', data: '' }
  },
}
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
        ├── columns:  ColumnNode[]
        ├── header?:  HeaderNode
        ├── sections: SectionNode[]
        │     └── rows: RowNode[]
        │           └── cells: CellNode[]
        ├── rows:     RowNode[]
        └── charts:   ChartNode[]
              └── series: ChartSeriesNode[]
```

All types are exported:

```ts
import type {
  WorkbookNode, SheetNode, SectionNode, RowNode, CellNode,
  ColumnNode, HeaderNode, FormulaNode, SheetDefinition, Adapter, RenderResult,
  ChartNode, ChartSeriesNode, ChartPoint, ChartType,
} from 'nextsheet'
```

---

## How it works

NextSheet ships a custom JSX runtime (`jsxImportSource: "nextsheet"`). When TypeScript compiles your `.sheet.tsx`, each JSX element calls `jsx(Component, props)` which immediately invokes the component function. There is no virtual DOM. Components are pure functions that return IR nodes. The adapter consumes the IR.

This means NextSheet has zero runtime overhead — there is nothing to mount, diff, or reconcile. A sheet is just a function call.

---

## License

MIT — [nextsheet/nextsheet](https://github.com/nextsheet/nextsheet)
