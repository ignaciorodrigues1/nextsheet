# nextsheet

> The framework for the spreadsheet era.

Build spreadsheets as typed React-like components. One codebase compiles to CSV, Excel, Google Sheets, and any backend you need. Now with a first-class Agent API for LLM-driven workbook manipulation.

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

## Agent API

The `nextsheet/agent` entrypoint gives LLMs a structured way to create and edit workbooks — without string parsing, brittle prompts, or custom schemas.

```ts
import {
  wb, fromWorkbook,
  toAnthropicTools, toOpenAITools,
  validatePatch, validateWorkbook, validatePatches,
  AgentError,
} from 'nextsheet/agent'
```

### Build a workbook programmatically

```ts
import { wb } from 'nextsheet/agent'
import { xlsxAdapter } from 'nextsheet'

const builder = wb('Q1 Finance')
  .sheet('Revenue', (s) => {
    s.column('Month',   'string',   { primary: true })
     .column('Revenue', 'currency', { currency: 'USD' })
     .column('Growth',  'percent')
     .row(['Jan', 420_000, 0.08])
     .row(['Feb', 510_000, 0.21])
     .row(['Mar', 480_000, -0.06])
  })

const node = builder.build()
const xlsx = await xlsxAdapter.render(node)
```

### Edit an existing workbook with patches

Use `applyPatch()` to apply one or more operations atomically. Great for applying LLM-generated edits to a workbook the user already has open.

```ts
import { fromWorkbook } from 'nextsheet/agent'

const builder = fromWorkbook(existingNode)   // deep-copies the node

builder.applyPatch(
  { op: 'addRow',    sheet: 'Revenue', values: { Month: 'Apr', Revenue: 560_000, Growth: 0.17 } },
  { op: 'updateCell', sheet: 'Revenue', rowIndex: 0, column: 'Revenue', value: 425_000 },
  { op: 'addColumn', sheet: 'Revenue', name: 'Forecast', type: 'currency' },
)

const updated = builder.build()
```

### Patch operations

| `op` | Required fields | Description |
|---|---|---|
| `addRow` | `sheet`, `values` | Append or insert a row. `values` maps column name → value. |
| `removeRow` | `sheet`, `rowIndex` | Remove the row at a 0-based index. |
| `updateCell` | `sheet`, `rowIndex`, `column` | Set `value`, `formula`, `format`, `color`, and/or `bold` on a cell. |
| `addColumn` | `sheet`, `name`, `type` | Append or insert a column. Adds a null cell to every existing row. |
| `removeColumn` | `sheet`, `column` | Remove a column and its cells from all rows. |
| `updateColumn` | `sheet`, `column`, `updates` | Rename, retype, or change options on a column. |
| `setHeader` | `sheet`, `title` | Set the sheet header title (and optional subtitle). |
| `addSheet` | `name` | Add a blank sheet to the workbook. |
| `removeSheet` | `sheet` | Remove a sheet by name. |
| `renameSheet` | `sheet`, `newName` | Rename a sheet. |
| `addChart` | `sheet`, `chart` | Append a chart to a sheet. |

Column types: `string` · `number` · `currency` · `boolean` · `date` · `percent`

Chart types: `bar` · `horizontal-bar` · `line` · `area` · `stacked-bar` · `stacked-area` · `pie` · `donut` · `scatter` · `bubble` · `radar`

### Error handling

`applyPatch()` throws `AgentError` (a subclass of `Error`) on invalid operations. The `code` property is safe to switch on.

```ts
import { AgentError } from 'nextsheet/agent'

try {
  builder.applyPatch({ op: 'addRow', sheet: 'Typo', values: {} })
} catch (e) {
  if (e instanceof AgentError) {
    console.error(e.code)   // 'SHEET_NOT_FOUND'
    console.error(e.op)     // 'addRow'
    console.error(e.message) // '[SHEET_NOT_FOUND] addRow: sheet "Typo" does not exist'
  }
}
```

| Code | Trigger |
|---|---|
| `SHEET_NOT_FOUND` | `sheet` references a name that doesn't exist |
| `SHEET_ALREADY_EXISTS` | `addSheet` / `renameSheet` targets an existing name |
| `COLUMN_NOT_FOUND` | `column` references a name not in the sheet |
| `COLUMN_ALREADY_EXISTS` | `addColumn` / `updateColumn` rename uses a name already in use |
| `ROW_OUT_OF_BOUNDS` | `rowIndex` is negative or ≥ rows.length |
| `EMPTY_UPDATE` | `updateColumn` called with an empty `updates` object |

### Validation

Validate LLM output before passing it to `applyPatch()` to avoid runtime errors.

```ts
import { validatePatch, validateWorkbook, validatePatches } from 'nextsheet/agent'

// Single patch
const r = validatePatch(agentOutput)
if (!r.valid) {
  console.error(r.errors)  // ['op: must be equal to one of the allowed values', ...]
} else {
  builder.applyPatch(agentOutput as PatchOperation)
}

// Array of patches — returns index of first invalid one
const r2 = validatePatches(agentPatches)
if (!r2.valid) {
  throw new Error(`Patch[${r2.index}] is invalid: ${r2.errors.join(', ')}`)
}

// Whole workbook (from create_workbook tool)
const r3 = validateWorkbook(toolCallInput)
if (r3.valid) {
  const node = toolCallInput as WorkbookNode
}
```

### LLM tool definitions

Pass tool schemas directly to the Anthropic or OpenAI API:

```ts
import { toAnthropicTools, toOpenAITools } from 'nextsheet/agent'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const response = await client.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 4096,
  tools: toAnthropicTools(),   // create_workbook + patch_workbook
  messages: [
    { role: 'user', content: 'Create a sales dashboard with monthly revenue data for Q1.' }
  ],
})
```

```ts
import { toOpenAITools } from 'nextsheet/agent'
import OpenAI from 'openai'

const openai = new OpenAI()

const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  tools: toOpenAITools(),
  messages: [{ role: 'user', content: 'Add a Forecast column to the Revenue sheet.' }],
})
```

The two built-in tools are:

| Tool | Input | Description |
|---|---|---|
| `create_workbook` | `WorkbookNode` JSON | Create a full workbook in one shot |
| `patch_workbook` | `{ patches: PatchOperation[] }` | Apply an ordered list of edits |

### JSON Schemas

All schemas are exported for use in your own tool definitions or JSON Schema validators:

```ts
import {
  workbookSchema, sheetSchema, columnSchema, rowSchema, cellSchema,
  patchSchema,
  addRowSchema, updateCellSchema, removeRowSchema,
  addColumnSchema, removeColumnSchema, updateColumnSchema,
  setHeaderSchema,
  addSheetSchema, removeSheetSchema, renameSheetSchema,
  addChartSchema,
} from 'nextsheet/agent'
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
