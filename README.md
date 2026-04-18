<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./.github/assets/logo-light.svg">
    <img alt="NextSheet" src="./.github/assets/logo-light.svg" width="180">
  </picture>

  <h3>The framework for the spreadsheet era.</h3>

  <p>A billion people author logic inside spreadsheets every day.<br/>
  They have never had a framework. NextSheet is that framework.</p>

  <p>
    <a href="#the-thesis">Thesis</a> ·
    <a href="#getting-started">Getting Started</a> ·
    <a href="#how-it-works">How it works</a> ·
    <a href="#theme">Theme</a> ·
    <a href="#environment-variables">Environment</a> ·
    <a href="#live-backends">Live Backends</a> ·
    <a href="#charts">Charts</a> ·
    <a href="#preview-features">Preview</a> ·
    <a href="#agent-api">Agent API</a> ·
    <a href="#deploy">Deploy</a> ·
    <a href="#roadmap">Roadmap</a>
  </p>

  <p>
    <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-000000.svg?style=flat-square" />
    <img alt="Version" src="https://img.shields.io/badge/version-0.4.0-000000.svg?style=flat-square" />
    <img alt="TypeScript" src="https://img.shields.io/badge/typescript-strict-000000.svg?style=flat-square" />
    <img alt="pnpm" src="https://img.shields.io/badge/pnpm-workspace-000000.svg?style=flat-square" />
  </p>
</div>

---

## The thesis

The spreadsheet is the most successful programming model ever shipped. It runs the world's finance, operations, science, and supply chains. It is the default interface humans reach for when data needs structure. And it has scaled to a billion users without a framework, a component model, a type system, or a deploy target.

Every other discipline of software has had its inflection point. The web had React. The backend had Rails, then Next.js, then the edge. Data had dbt. Design had Figma. The spreadsheet — the single most-used piece of structured software on Earth — is still authored the way it was in 1985.

NextSheet is the bet that this ends now.

We are building the open source framework for authoring spreadsheets the way modern software is built: as components, with end-to-end types, composed from primitives, versioned in Git, deployed to any backend, and authored by humans and agents alike. One codebase, any surface — Google Sheets, Excel Online, `.xlsx`, CSV, and whatever comes next.

---

## Getting Started

### Automatic (recommended)

The fastest way to start a NextSheet project:

```bash
npx create-nextsheet-app
# or
pnpm create nextsheet-app
# or
bun create nextsheet-app
```

You will see the following prompts:

```
┌  create-nextsheet-app

◆  What is your project named?
│  my-workbook

◆  How would you like to set up your project?
│  ● Use recommended defaults  (TypeScript · ESLint · example sheets)
│  ○ Customize settings
```

If you choose to customize:

```
◆  Would you like to use TypeScript?  Yes / No
◆  Which linter?  ESLint / Biome / None
◆  Would you like example sheets?  Yes / No
◆  Would you like to configure a live backend?  None / Google Sheets / Excel Online
◆  Which package manager?  pnpm / npm / yarn / bun
```

To skip prompts and use recommended defaults:

```bash
npx create-nextsheet-app my-workbook --yes
```

### What gets created

```
my-workbook/
├── sheets/
│   └── Sales.sheet.tsx     ← example sheet with columns, sections, chart
├── nextsheet.config.ts     ← theme: colors, typography, column widths
├── .env.example            ← all supported env vars with comments
├── .env.local              ← your local secrets (gitignored)
├── .gitignore
├── tsconfig.json           ← jsxImportSource: "nextsheet" preconfigured
├── eslint.config.js
├── README.md
└── package.json            ← dev, build, build:csv, deploy, lint, typecheck
```

### Start developing

```bash
cd my-workbook
pnpm dev        # live preview at http://localhost:3000
```

---

### Manual install

If you prefer to add NextSheet to an existing project:

```bash
npm install nextsheet
npm install --save-dev nextsheet-cli
```

Configure JSX in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "nextsheet"
  }
}
```

---

## How it works

### A sheet is a component

```tsx
// sheets/Invoices.sheet.tsx
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

### Reports compose the same way React apps do

```tsx
// sheets/QuarterlyReport.sheet.tsx
import { Sheet, Section, Row, Cell, Header, useFormula, useQuery } from 'nextsheet'

interface Region { id: string; name: string; revenue: number; growth: number }

const regions: Region[] = [
  { id: 'north', name: 'North', revenue: 520_000, growth: 0.12 },
  { id: 'south', name: 'South', revenue: 310_000, growth: 0.08 },
]

export default function QuarterlyReport() {
  const total  = useFormula(() => regions.reduce((s, r) => s + r.revenue, 0))
  const topReg = useQuery(regions).orderBy('revenue', 'desc').first()

  return (
    <Sheet name="Q1 Report" theme="minimal">
      <Header title="Quarterly Revenue" subtitle="January — March 2026" />

      <Section title="Revenue by region">
        <Row header>
          <Cell>Region</Cell>
          <Cell>Revenue</Cell>
          <Cell>Growth</Cell>
        </Row>
        {regions.map((r) => (
          <Row key={r.id}>
            <Cell>{r.name}</Cell>
            <Cell format="currency">{r.revenue}</Cell>
            <Cell format="percent" color={r.growth > 0 ? 'green' : 'red'}>
              {r.growth}
            </Cell>
          </Row>
        ))}
      </Section>

      <Section title="Summary">
        <Row><Cell bold>Total revenue</Cell><Cell format="currency">{total}</Cell></Row>
        <Row><Cell bold>Top region</Cell><Cell>{topReg?.name}</Cell></Row>
      </Section>
    </Sheet>
  )
}
```

### Hooks

```tsx
import { useFormula, useQuery, useRange, SUM, AVERAGE, col } from 'nextsheet'

// useFormula — evaluates a JS expression at build time.
// When targeting xlsx / Google Sheets, formula helpers transpile to native formulas.
const total = useFormula(() => rows.reduce((s, r) => s + r.amount, 0))

// Formula helpers: produce live spreadsheet formulas (=SUM(B:B)) on xlsx/Sheets targets.
const sum  = useFormula(() => SUM(col('amount')))     // → =SUM(B:B)
const avg  = useFormula(() => AVERAGE(col('price')))  // → =AVERAGE(C:C)

// useQuery — chainable in-memory query over any array.
const topRep = useQuery(sales).orderBy('amount', 'desc').first()

// useRange — reads live data from a connected Google Sheet or Excel workbook.
const sales = useRange<Sale>('Sales!A2:D')
```

### Column options (dropdown filters)

Add `options` to a `<Column>` to enable a cross-sheet filter bar in the dev preview and data validation in Excel:

```tsx
<Column
  name="status"
  type="string"
  options={['pending', 'paid', 'overdue']}
/>
```

In the HTML preview, each column with `options` becomes a `<select>` in the filter bar at the top of the sheet. Filters are **cross-sheet**: selecting "paid" on the Invoices tab also filters any other sheet that contains a column with the same name.

### Pagination

Add `<Paginate>` inside a `<Sheet>` to split large sheets into pages in the HTML preview:

```tsx
import { Sheet, Column, Section, Row, Cell, Paginate } from 'nextsheet'

export default function Expenses() {
  return (
    <Sheet name="Expenses">
      <Paginate pageSize={25} />
      <Column name="date"   type="date"   primary />
      <Column name="amount" type="currency" />
      <Column name="category" type="string"
        options={['Food', 'Transport', 'Housing', 'Health']}
      />
      {/* rows... */}
    </Sheet>
  )
}
```

Pagination and column filters compose cleanly — the page always shows only rows that pass the active filters.

---

## Theme

`nextsheet.config.ts` is the single place to define your workbook's visual identity — colors, typography, and layout. Every project generated by `create-nextsheet-app` includes one. Think of it as `tailwind.config.ts` for spreadsheets.

```ts
// nextsheet.config.ts
import { defineConfig } from 'nextsheet'

export default defineConfig({
  theme: {
    colors: {
      /** Header row background and chart accent color. */
      primary: '#3b82f6',
      /** Page / sheet background (HTML dev preview). */
      background: '#ffffff',
      /** Default cell text color. */
      text: '#111827',
      /** Text color on primary-colored header rows. */
      headerText: '#ffffff',
      /** Table and cell border color. */
      border: '#e5e7eb',
      /** Labels, subtitles, and dim text. */
      muted: '#6b7280',
    },
    typography: {
      /** Font family for cell content. Any system or web-safe font name. */
      fontFamily: 'Inter',
      /** Base font size in points (xlsx) or pixels (HTML preview). */
      fontSize: 11,
      /** Sheet title font size. */
      headerFontSize: 16,
    },
    sheet: {
      /** Default column width — characters in xlsx, proportional in HTML preview. */
      columnWidth: 18,
    },
  },
})
```

### Where each setting applies

| Setting | `.xlsx` | HTML preview |
|---|---|---|
| `colors.primary` | Header row fill | Column header background |
| `colors.headerText` | Header row font color | Column header text color |
| `colors.background` | — | Page background |
| `colors.text` | — | Cell text and accent |
| `colors.border` | — | Table borders |
| `colors.muted` | — | Dim labels and subtitles |
| `typography.fontFamily` | Cell font name | `--font-ui` CSS variable |
| `typography.fontSize` | Cell font size (pt) | Base font size (px) |
| `typography.headerFontSize` | Title cell font size (pt) | — |
| `sheet.columnWidth` | Column width (chars) | — |

### Hot reload in dev

The dev server watches `nextsheet.config.ts` alongside your sheet files. Saving the config immediately re-applies the theme and reloads the browser — no restart needed.

```bash
nextsheet dev sheets/Sales.sheet.tsx
# Edit nextsheet.config.ts → theme reloads in the browser automatically
```

---

## Environment variables

NextSheet loads `.env` files automatically — the same priority model as Next.js.

### File priority

| File | Purpose |
|---|---|
| `.env` | Base variables. Safe to commit. |
| `.env.development` | Loaded only by `nextsheet dev`. |
| `.env.production` | Loaded only by `nextsheet build` and `nextsheet deploy`. |
| `.env.local` | Local overrides. **Add to `.gitignore`. Never commit.** |
| `.env.development.local` | Local dev overrides. Gitignored. |
| `.env.production.local` | Local production overrides. Gitignored. |

Shell environment variables always take the highest priority and are never overwritten.

### Syntax

```sh
# Plain value
MY_API_KEY=abc123

# Quoted — preserves spaces and special characters
DATABASE_URL="postgresql://user:pass@host/db"

# Inline comment
API_TIMEOUT=5000 # milliseconds

# Escaped newlines (double-quoted only)
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE..."

# export prefix is supported
export MY_VAR=value
```

### Access in sheets

Variables are injected into `process.env` before any sheet file is evaluated. Access them directly:

```tsx
// sheets/Sales.sheet.tsx
const apiKey  = process.env.MY_API_KEY
const baseUrl = process.env.MY_API_BASE_URL

export default defineSheet('Sales', () => (
  <Sheet>
    <Column name="product" type="string" />
  </Sheet>
))
```

### What the CLI logs

```
  env: .env, .env.local → 4 vars loaded
```

---

## Live backends

`useRange(address)` connects a sheet to a live spreadsheet. During `nextsheet dev` and `nextsheet build`, the CLI pre-fetches all referenced ranges before rendering — no changes to your sheet code needed.

### How it works

The CLI performs a two-pass render:

1. **Collection pass** — `useRange()` records every address used in the sheet, returns `[]`.
2. **Prefetch** — all addresses are fetched from the backend in parallel.
3. **Render pass** — `useRange()` returns the fetched rows, rendering the workbook with live data.

### Google Sheets

```tsx
// sheets/Sales.sheet.tsx
interface SaleRow { product: string; qty: number; price: number }

export default defineSheet('Sales', () => {
  const rows = useRange<SaleRow>('Sales!A2:D')
  const top5 = useQuery(rows).orderBy('price', 'desc').limit(5).toArray()

  return (
    <Sheet>
      <Column name="product" type="string" />
      <Column name="qty"     type="number" />
      <Column name="price"   type="currency" />
      {top5.map(r => (
        <Row key={r.product}>
          <Cell>{r.product}</Cell>
          <Cell>{r.qty}</Cell>
          <Cell>{r.price}</Cell>
        </Row>
      ))}
    </Sheet>
  )
})
```

Pass credentials via `.env.local` or CLI flags:

```bash
# .env.local
GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SERVICE_ACCOUNT_KEY={"client_email":"...","private_key":"..."}
# or: GOOGLE_ACCESS_TOKEN=ya29.a0...
```

```bash
# Dev with live data
nextsheet dev sheets/Sales.sheet.tsx

# Poll the backend every 10 seconds
nextsheet dev sheets/Sales.sheet.tsx --poll 10000

# Build XLSX with live data
nextsheet build sheets/Sales.sheet.tsx --target xlsx
```

Or pass credentials inline:

```bash
nextsheet dev sheets/Sales.sheet.tsx \
  --google-spreadsheet-id 1BxiM... \
  --google-credentials "$GOOGLE_SERVICE_ACCOUNT_KEY"
```

### Excel Online

```bash
# .env.local
EXCEL_DRIVE_ITEM_ID=01ABCDEF...
MICROSOFT_ACCESS_TOKEN=eyJ0eXAiOiJKV1Qi...
```

```bash
nextsheet dev sheets/Sales.sheet.tsx
nextsheet build sheets/Sales.sheet.tsx --target xlsx
```

Or inline:

```bash
nextsheet dev sheets/Sales.sheet.tsx \
  --drive-item-id 01ABCDEF... \
  --microsoft-token "$MICROSOFT_ACCESS_TOKEN"
```

### `useRange` address format

| Address | Fetches |
|---|---|
| `'Sales!A2:D'` | Sheet "Sales", columns A–D, row 2 onwards |
| `'A2:D10'` | Default sheet, explicit range |
| `'Sheet1!B:D'` | Entire columns B–D on Sheet1 |

The first row of the fetched range is used as object keys. All subsequent rows become typed objects `T[]`.

---

## Charts

NextSheet ships `<Chart>` and `<ChartSeries>` components. In `nextsheet dev` they render as interactive Chart.js visualizations in the browser preview.

```tsx
import { Sheet, Column, Section, Row, Cell, Chart, ChartSeries } from 'nextsheet'

const months  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
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

      <Chart type="bar" title="Revenue vs Expenses" xAxis="Month">
        <ChartSeries name="Revenue"  column="Revenue"  color="#22c55e" />
        <ChartSeries name="Expenses" column="Expenses" color="#ef4444" />
      </Chart>
    </Sheet>
  )
}
```

#### Chart types

| Type | Description |
|---|---|
| `bar` | Vertical bars, one bar per series per category |
| `horizontal-bar` | Horizontal bars (flips axes) |
| `line` | Line chart with optional data points |
| `area` | Filled line chart |
| `stacked-bar` | Bars stacked on top of each other |
| `stacked-area` | Stacked filled lines |
| `pie` | Circular slice chart |
| `donut` | Pie with a hollow center |
| `scatter` | Points at (x, y) coordinates |
| `bubble` | Points with variable radius (x, y, r) |
| `radar` | Spider/radar polygon |

#### `<Chart>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `ChartType` | required | Chart type |
| `title` | `string` | — | Chart title |
| `xAxis` | `string` | — | Column name for x-axis labels |
| `showLegend` | `boolean` | `true` | Show the series legend |
| `width` | `number` | — | Max width in pixels |
| `height` | `number` | `320` | Height in pixels |

#### `<ChartSeries>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | required | Series label |
| `column` | `string` | — | Column name to read values from |
| `data` | `number[]` | — | Inline array of values |
| `points` | `ChartPoint[]` | — | `{x, y, r?}` for scatter/bubble |
| `color` | `string` | auto | Hex color or CSS named color |

---

## Preview features

`nextsheet dev` opens a full-featured browser preview that does more than just display your data.

### Column sort

Click any column header to sort that column. Click again to reverse. Click a third time to reset to original order.

- Detects numeric vs. string values automatically (strips currency symbols, commas, percent signs before comparing).
- Section groupings are temporarily hidden while a sort is active and restored on reset.

### Search (⌘K)

Press `⌘K` (or `Ctrl+K` on Windows/Linux) or click the search icon in the top-right to open the search bar. Type to filter all rows across all sheets simultaneously.

- Matches against the full text content of every cell.
- Shows a `N / total rows` count as you type.
- Press `Escape` to dismiss and clear.

### Filter bar

Columns with `options` render a dropdown filter bar above the table. Selecting a value hides rows that don't match. Filters are **cross-sheet** — selecting "paid" on one tab also filters any sheet that contains a column with the same name. Filter state is persisted in `sessionStorage`.

### Schema Inspector

Click the `{ }` button in the top-right to open the Schema Inspector panel. It slides in from the right and shows:

- Every column: name, type badge, PK / required / formula indicators, and all `options` values.
- Pagination config (page size) when `<Paginate>` is used.
- Chart count per sheet.
- Tab bar to switch between sheets without leaving the inspector.

---

## Agent API

`nextsheet/agent` is a programmatic authoring surface designed for LLMs and automated pipelines. Import it separately — the main `nextsheet` bundle is not affected.

```bash
npm install nextsheet
```

```ts
import { wb, toAnthropicTools, toOpenAITools } from 'nextsheet/agent'
import { xlsxAdapter } from 'nextsheet'
```

### WorkbookBuilder

Build workbooks programmatically with a fluent API:

```ts
import { wb } from 'nextsheet/agent'
import { xlsxAdapter } from 'nextsheet'

const workbook = wb('Sales Report')
  .sheet('Q1 Sales', (s) => {
    s.header('Q1 Sales Report', 'January – March 2026')
     .column('Product', 'string', { primary: true })
     .column('Revenue', 'currency', { currency: 'USD' })
     .column('Units', 'number')
     .column('Region', 'string', { options: ['North', 'South', 'East', 'West'] })
     .section('Electronics', [
       ['Laptop Pro',  98_000, 42, 'North'],
       ['Monitor 4K',  31_000, 88, 'East'],
     ])
     .section('Accessories', [
       ['Keyboard',    12_500, 210, 'South'],
       ['Mouse',        8_200, 185, 'West'],
     ])
     .paginate(25)
  })
  .build()

const result = await xlsxAdapter.render(workbook)
```

### Patch operations

Apply typed patches to an existing workbook — useful for LLM tool-call results:

```ts
import { wb } from 'nextsheet/agent'
import type { PatchOperation } from 'nextsheet/agent'

const base = wb('Invoices').sheet('Invoices', (s) => {
  s.column('client', 'string', { required: true })
   .column('amount', 'currency', { currency: 'USD' })
   .column('status', 'string', { options: ['pending', 'paid', 'overdue'] })
}).build()

// LLM returns patch operations — apply them:
const patches: PatchOperation[] = [
  { op: 'addRow', sheet: 'Invoices', values: { client: 'Acme Corp', amount: 4200, status: 'pending' } },
  { op: 'updateCell', sheet: 'Invoices', rowIndex: 0, column: 'status', value: 'paid', color: 'green' },
  { op: 'addColumn', sheet: 'Invoices', name: 'due_date', type: 'date' },
]

const updated = wb('Invoices')
  .addSheet(base.sheets[0])
  .applyPatch(...patches)
  .build()
```

#### Patch operations reference

| Operation | Fields | Description |
|---|---|---|
| `addRow` | `sheet`, `values`, `at?` | Append or insert a row |
| `updateCell` | `sheet`, `rowIndex`, `column`, `value`, `color?`, `bold?` | Update a single cell |
| `removeRow` | `sheet`, `rowIndex` | Delete a row by index |
| `addColumn` | `sheet`, `name`, `type`, `options?`, `formula?`, `at?` | Add a column |
| `removeColumn` | `sheet`, `column` | Remove a column by name |
| `setHeader` | `sheet`, `title`, `subtitle?` | Set the sheet header |
| `addSheet` | `name` | Append a new empty sheet |
| `renameSheet` | `sheet`, `newName` | Rename an existing sheet |

### LLM tool definitions

`nextsheet/agent` exports pre-built tool definitions for Anthropic and OpenAI — no manual schema writing needed:

```ts
import Anthropic from '@anthropic-ai/sdk'
import { toAnthropicTools, wb } from 'nextsheet/agent'
import { xlsxAdapter } from 'nextsheet'

const client = new Anthropic()

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  tools: toAnthropicTools(),
  messages: [{
    role: 'user',
    content: 'Create a Q2 sales report with regions and revenue by product.',
  }],
})

// Handle tool_use blocks from the response
for (const block of response.content) {
  if (block.type === 'tool_use' && block.name === 'create_workbook') {
    const workbook = block.input  // Already matches WorkbookNode shape
    const xlsx = await xlsxAdapter.render(workbook as any)
    // save xlsx.data ...
  }
}
```

```ts
// OpenAI
import OpenAI from 'openai'
import { toOpenAITools } from 'nextsheet/agent'

const client = new OpenAI()

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  tools: toOpenAITools(),
  messages: [{ role: 'user', content: 'Create a budget tracker workbook.' }],
})
```

### JSON Schemas

The exported schemas are plain JSON Schema objects — use them for validation or to generate your own tools:

```ts
import { workbookSchema, sheetSchema, columnSchema, patchSchema } from 'nextsheet/agent'

// Validate LLM output with ajv, zod-from-json-schema, etc.
import Ajv from 'ajv'
const ajv = new Ajv()
const validate = ajv.compile(workbookSchema)
const valid = validate(llmOutput)
```

---

## CLI reference

### `nextsheet build`

Compile sheet files to a spreadsheet format.

```
nextsheet build <files...> [options]

Options:
  -t, --target <target>          csv | xlsx | supersheet  (default: csv)
  -o, --out <path>               Output file path
  -n, --name <name>              Workbook name  (default: Workbook)

Live backend (for useRange):
  --google-spreadsheet-id <id>   Google Sheets ID  (or GOOGLE_SPREADSHEET_ID env)
  --google-access-token <token>  OAuth2 token  (or GOOGLE_ACCESS_TOKEN env)
  --google-credentials <json>    Service account key  (or GOOGLE_SERVICE_ACCOUNT_KEY env)
  --microsoft-token <token>      Graph API token  (or MICROSOFT_ACCESS_TOKEN env)
  --drive-item-id <id>           OneDrive item ID  (or EXCEL_DRIVE_ITEM_ID env)
```

```bash
# CSV
nextsheet build sheets/Report.sheet.tsx --target csv --out dist/report.csv

# Excel
nextsheet build sheets/Report.sheet.tsx --target xlsx

# Multiple sheets → one workbook
nextsheet build sheets/Invoices.sheet.tsx sheets/Expenses.sheet.tsx \
  --target xlsx --name "Finance 2026"

# XLSX with live Google Sheets data
nextsheet build sheets/Sales.sheet.tsx --target xlsx
# (reads GOOGLE_SPREADSHEET_ID and GOOGLE_SERVICE_ACCOUNT_KEY from .env.local)
```

### `nextsheet dev`

Start a live preview server with hot reload.

```
nextsheet dev <files...> [options]

Options:
  -p, --port <port>              Port  (default: 3000)
  -n, --name <name>              Workbook name

Live backend:
  --google-spreadsheet-id <id>
  --google-access-token <token>
  --google-credentials <json>
  --microsoft-token <token>
  --drive-item-id <id>
  --poll <ms>                    Re-fetch backend data every N milliseconds
```

```bash
# Static preview
nextsheet dev sheets/Report.sheet.tsx

# With live Google Sheets data, refresh every 15 seconds
nextsheet dev sheets/Sales.sheet.tsx --poll 15000
```

The preview opens automatically in your browser. Files are rebuilt on every save; the browser reloads via SSE without losing scroll position. Use ⌘K to search rows, click column headers to sort, and `{ }` to open the Schema Inspector.

### `nextsheet deploy`

Deploy to SuperSheet, Google Sheets, or Excel Online.

```
nextsheet deploy <files...> [options]

Options:
  -t, --target <target>          supersheet | google | excel-online  (default: supersheet)
  -n, --name <name>              Workbook name
```

#### `--target supersheet`

```
  --supabase-url <url>           Supabase project URL  (or SUPABASE_URL env)
  --anon-key <key>               Supabase anon key  (or SUPABASE_ANON_KEY env)
  --jwt <token>                  Session JWT  (or SUPABASE_JWT env)
  --workbook-id <id>             Update an existing workbook instead of creating one
```

```bash
nextsheet deploy sheets/*.sheet.tsx --target supersheet --name "Finance 2026"
```

#### `--target google`

Pushes the workbook to a Google Sheet. Creates a new spreadsheet if no ID is given.

```
  --spreadsheet-id <id>          Update existing sheet  (or GOOGLE_SPREADSHEET_ID env)
  --google-access-token <token>  (or GOOGLE_ACCESS_TOKEN env)
  --google-credentials <json>    Service account key  (or GOOGLE_SERVICE_ACCOUNT_KEY env)
```

```bash
nextsheet deploy sheets/Sales.sheet.tsx --target google
# → Deployed → https://docs.google.com/spreadsheets/d/...
```

What the Google Sheets adapter does:
- Creates a new spreadsheet (or updates an existing one)
- Writes headers and data rows via `values:batchUpdate`
- Translates column formulas (`amount * 1.21` → `=B3 * 1.21`) to native Sheets formulas
- Applies formatting: bold + frozen header row, currency/percent/date number formats

#### `--target excel-online`

Pushes the workbook to OneDrive as an `.xlsx` file.

```
  --drive-item-id <id>           Update existing file  (or EXCEL_DRIVE_ITEM_ID env)
  --microsoft-token <token>      Graph API token  (or MICROSOFT_ACCESS_TOKEN env)
  --excel-file-name <name>       File name when creating  (default: workbook name)
```

```bash
nextsheet deploy sheets/Sales.sheet.tsx --target excel-online
# → Deployed → https://onedrive.live.com/...
```

When no `--drive-item-id` is given, NextSheet generates the `.xlsx` file locally via the XLSX adapter and uploads it to OneDrive root.

---

## Deploy

### Google Sheets

1. Create a service account in Google Cloud Console and download the JSON key.
2. Share your target spreadsheet with the service account email.
3. Add credentials to `.env.local`:

```sh
GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","client_email":"...","private_key":"..."}
```

4. Deploy:

```bash
nextsheet deploy sheets/*.sheet.tsx --target google
```

### Excel Online

1. Obtain a Microsoft Graph API access token (OAuth2 with `Files.ReadWrite` scope).
2. Add to `.env.local`:

```sh
MICROSOFT_ACCESS_TOKEN=eyJ0eXAiOiJKV1Qi...
# Optional: to update an existing file instead of creating a new one
EXCEL_DRIVE_ITEM_ID=01ABCDEFGH...
```

3. Deploy:

```bash
nextsheet deploy sheets/*.sheet.tsx --target excel-online
```

### SuperSheet

SuperSheet is the hosted platform for NextSheet workbooks.

**Option A — CLI deploy:**

```bash
export SUPABASE_URL=https://xxxx.supabase.co
export SUPABASE_ANON_KEY=eyJhbGci...
export SUPABASE_JWT=eyJhbGci...

nextsheet deploy sheets/*.sheet.tsx --name "Finance 2026"
```

Getting your JWT from the browser console on your SuperSheet tab:

```js
JSON.parse(
  localStorage.getItem(
    Object.keys(localStorage).find(k => k.endsWith('-auth-token'))
  )
).access_token
```

**Option B — via GitHub:**

```bash
nextsheet build sheets/*.sheet.tsx --target supersheet
# → creates nextsheet.output.json

git add nextsheet.output.json && git commit -m "build: update workbook"
git push
```

Then in SuperSheet: **Add New → NextSheet Project → enter repo URL**.

---

## Adapters

Adapters are pluggable. Use the built-in ones or write your own.

```ts
import { workbook, csvAdapter, xlsxAdapter } from 'nextsheet'
import MySheet from './sheets/MySheet.sheet.js'

const wb = workbook('My Report', [MySheet])

const csv  = await csvAdapter.render(wb)   // { mimeType, extension, data: string }
const xlsx = await xlsxAdapter.render(wb)  // { mimeType, extension, data: Buffer }
```

Implement the `Adapter` interface to target any surface:

```ts
import type { Adapter, WorkbookNode, RenderResult } from 'nextsheet'

export class NotionAdapter implements Adapter {
  readonly name = 'notion'

  async render(workbook: WorkbookNode): Promise<RenderResult> {
    // traverse workbook.sheets → sections → rows → cells
    return { mimeType: 'application/json', extension: 'json', data: '...' }
  }
}
```

---

## What's implemented

### Core runtime — `packages/nextsheet`

| Feature | Status |
|---|---|
| Custom JSX runtime (`jsxImportSource: "nextsheet"`) | ✅ |
| `Sheet`, `Column`, `Row`, `Cell`, `Section`, `Header` components | ✅ |
| `Formula` component (expression capture) | ✅ |
| `Paginate` component (preview pagination) | ✅ |
| `Column` `options` prop (dropdown filters + xlsx data validation) | ✅ |
| `defineSheet(name, render)` | ✅ |
| `workbook(name, sheets[])` | ✅ |
| `useFormula(fn)` — JS evaluation at build time | ✅ |
| `useFormula` + formula helpers (`SUM`, `AVERAGE`, `col`…) → native spreadsheet formulas | ✅ |
| `useQuery(data)` — chainable in-memory query | ✅ |
| `useRange(address)` — live backend hook | ✅ |
| `Chart` + `ChartSeries` components | ✅ |
| `defineConfig` — theme config (`nextsheet.config.ts`) | ✅ |
| CSV adapter | ✅ |
| XLSX adapter (via ExcelJS) — theme-aware | ✅ |
| SuperSheet adapter | ✅ |
| Google Sheets backend (`nextsheet/backends`) | ✅ |
| Excel Online backend (`nextsheet/backends`) | ✅ |
| Pluggable `Adapter` interface | ✅ |
| Enterprise types (`nextsheet` — RBAC, audit, connectors, SSO, scheduling) | ✅ |
| **Agent API** (`nextsheet/agent`) | ✅ |
| `WorkbookBuilder` — fluent programmatic API | ✅ |
| `applyPatch()` — typed patch operations for LLM tool-use | ✅ |
| JSON Schemas (`workbookSchema`, `patchSchema`, …) | ✅ |
| `toAnthropicTools()` / `toOpenAITools()` — ready-to-use tool definitions | ✅ |

### CLI — `packages/nextsheet-cli`

| Command | Status |
|---|---|
| `nextsheet build --target csv \| xlsx \| supersheet` | ✅ |
| `nextsheet build` with live backend data (`useRange`) | ✅ |
| `nextsheet build` with formula transpilation (`xlsx`, `supersheet`) | ✅ |
| `nextsheet dev` — browser preview with hot reload (SSE) | ✅ |
| `nextsheet dev` with live backend + `--poll` | ✅ |
| `nextsheet dev` — theme hot reload (`nextsheet.config.ts`) | ✅ |
| `nextsheet deploy --target supersheet` | ✅ |
| `nextsheet deploy --target google` | ✅ |
| `nextsheet deploy --target excel-online` | ✅ |
| `.env` / `.env.local` / `.env.{mode}` loading | ✅ |
| `nextsheet.config.ts` — theme applied to xlsx + HTML preview | ✅ |
| **Preview: column sort** (click header → asc/desc/reset) | ✅ |
| **Preview: global search** (⌘K — filters rows by text across all sheets) | ✅ |
| **Preview: Schema Inspector** (`{ }` button — columns, types, options, pagination) | ✅ |
| **Preview: cross-sheet filter bar** (columns with `options`) | ✅ |
| **Preview: pagination** (`<Paginate>` component) | ✅ |

### Google Sheets deploy

| Feature | Status |
|---|---|
| Create new spreadsheet | ✅ |
| Update existing spreadsheet | ✅ |
| Column formula translation (JS → native Sheets formula) | ✅ |
| Bold + frozen header row | ✅ |
| Column type number formats (currency, percent, date) | ✅ |

### `create-nextsheet-app`

| Feature | Status |
|---|---|
| Interactive project wizard | ✅ |
| TypeScript / JavaScript | ✅ |
| ESLint / Biome / None | ✅ |
| Google Sheets / Excel Online / None backend | ✅ |
| `.env.example` + `.env.local` | ✅ |
| Example sheet with columns, sections, chart | ✅ |
| `nextsheet.config.ts` generated with full theme template | ✅ |
| `--yes` flag for non-interactive mode | ✅ |
| Package manager detection (pnpm / npm / yarn / bun) | ✅ |

---

## Monorepo structure

```
nextsheet/
├── packages/
│   ├── nextsheet/                # Core library
│   │   └── src/
│   │       ├── index.ts
│   │       ├── jsx-runtime.ts
│   │       ├── config.ts         # defineConfig, theme types, globalThis state
│   │       ├── components/       # Sheet, Column, Row, Cell, Section, Header, Formula, Chart, Paginate
│   │       ├── hooks/            # useFormula, useQuery, useRange
│   │       ├── formula/          # context, ref, functions (SUM, AVERAGE, col…)
│   │       ├── runtime/          # defineSheet, workbook, range-context
│   │       ├── backends/         # GoogleSheetsBackend, ExcelOnlineBackend
│   │       ├── adapters/         # csv, xlsx (theme-aware), supersheet
│   │       ├── agent/            # WorkbookBuilder, applyPatch, schemas, tool definitions
│   │       └── types/            # nodes, components, hooks, adapters, enterprise
│   ├── cli/                      # nextsheet CLI
│   │   └── src/
│   │       ├── index.ts
│   │       ├── loader.ts         # esbuild transpiler, two-pass backend + formula render
│   │       ├── config-loader.ts  # loads nextsheet.config.ts, sets active theme
│   │       ├── env.ts            # .env file loader
│   │       ├── commands/         # build, dev, deploy
│   │       ├── backends/         # resolveBackend() helper
│   │       ├── preview/          # render.ts — HTML preview (sort, search, filter, inspector)
│   │       └── deploy/           # google-sheets.ts, excel-online.ts
│   └── create-nextsheet-app/     # Project scaffolding CLI
│       └── src/
│           ├── index.ts
│           ├── prompts.ts        # @clack/prompts wizard
│           ├── create.ts         # file writing + install
│           └── templates.ts      # all generated file contents (incl. nextsheet.config.ts)
├── examples/
│   ├── invoices/                 # Schema-mode sheet
│   ├── quarterly-report/         # Report-mode sheet
│   └── personal-finance/         # Full example: 5 sheets, live CoinGecko API, charts, filters
├── tsconfig.base.json
└── pnpm-workspace.yaml
```

---

## Roadmap

- **v0.0 — RFC phase** ✅ Core API proposal, component model, adapter interface.
- **v0.1 — Core runtime** ✅ `defineSheet`, primitive components, CSV + XLSX + SuperSheet adapters, CLI (`build`, `dev`, `deploy`).
- **v0.2 — Formula translation + Theme** ✅ `useFormula(() => SUM(col('amount')))` transpiles to native spreadsheet formulas. `nextsheet.config.ts` — global theme config applied to xlsx output and HTML dev preview with hot reload.
- **v0.3 — Live backends** ✅ `useRange` hook, Google Sheets backend, Excel Online backend, `.env` loading, `nextsheet deploy --target google | excel-online`, `create-nextsheet-app`.
- **v0.4 — Developer tooling** ✅ Enhanced browser preview: column sort, ⌘K full-text search, Schema Inspector panel, cross-sheet filter bar with `Column options`, `<Paginate>` component, enterprise type system.
- **v0.5 — Agent API** ✅ `nextsheet/agent` — `WorkbookBuilder` fluent API, `applyPatch()` typed patch operations, JSON Schemas for LLM output validation, `toAnthropicTools()` / `toOpenAITools()` ready-to-use tool definitions.
- **v1.0 — Stable release** ⏳ Frozen public API. Full documentation at `nextsheet.dev`. Production guarantees.

---

## Principles

1. **Developer experience is the product.** Not a feature. Not a pillar. The product.
2. **Types are load-bearing.** A sheet that compiles is a sheet that works.
3. **Convention over configuration.** A `sheets/` directory, zero boilerplate, and it runs.
4. **Portable by default.** The same source compiles to every major spreadsheet surface.
5. **Git is the source of truth.** Everything NextSheet produces is reviewable, revertible, and diffable.
6. **Humans and agents are both first-class authors.** The API is designed for LLMs as deliberately as for humans.
7. **Progressive disclosure.** Easy things take one line. Hard things remain possible.
8. **Open source, forever.** MIT. Public roadmap. RFC-driven. Community-governed.

---

## Community

NextSheet is being designed in public. The earliest contributors have the most leverage over where it goes.

- **GitHub Discussions** — RFCs, API design, open questions, architectural debates.
- **Issues** — Bugs, features, scoped tasks.
- **Discord** — Real-time conversation with maintainers and contributors. *(launching soon)*

## Contributing

Strong places to start:

- Open or comment on an **RFC** in Discussions.
- Pick up a `good first issue` in the tracker.
- Build a new **adapter** (Notion, Airtable, Postgres, Parquet…).
- Improve documentation or examples.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full guide.

## License

NextSheet is [MIT licensed](./LICENSE).

---

<div align="center">
  <sub>The spreadsheet runs the world. It is time it had a framework worthy of its scale.</sub>
</div>
