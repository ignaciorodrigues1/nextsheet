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
    <a href="#charts">Charts</a> ·
    <a href="#supersheet-hosting">SuperSheet</a> ·
    <a href="#roadmap">Roadmap</a> ·
    <a href="#community">Community</a>
  </p>

  <p>
    <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-000000.svg?style=flat-square" />
    <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-000000.svg?style=flat-square" />
    <img alt="TypeScript" src="https://img.shields.io/badge/typescript-strict-000000.svg?style=flat-square" />
    <img alt="pnpm" src="https://img.shields.io/badge/pnpm-workspace-000000.svg?style=flat-square" />
  </p>
</div>

---

## The thesis

The spreadsheet is the most successful programming model ever shipped. It runs the world's finance, operations, science, and supply chains. It is the default interface humans reach for when data needs structure. And it has scaled to a billion users without a framework, a component model, a type system, or a deploy target.

Every other discipline of software has had its inflection point. The web had React. The backend had Rails, then Next.js, then the edge. Data had dbt. Design had Figma. The spreadsheet — the single most-used piece of structured software on Earth — is still authored the way it was in 1985.

NextSheet is the bet that this ends now.

We are building the open source framework for authoring spreadsheets the way modern software is built: as components, with end-to-end types, composed from primitives, versioned in Git, deployed to any backend, and authored by humans and agents alike. One codebase, any surface — Google Sheets, Excel, `.xlsx`, CSV, and whatever comes next.

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+ (for working in this monorepo)

### Install

```bash
# In your own project
npm install nextsheet
# or
pnpm add nextsheet
```

### Configure TypeScript

Add this to your `tsconfig.json` so TypeScript understands the NextSheet JSX syntax:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "nextsheet"
  }
}
```

### Write your first sheet

Create a file with the `.sheet.tsx` extension anywhere in your project:

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

### Build

```bash
# Output CSV
npx nextsheet build sheets/Invoices.sheet.tsx --target csv --out dist/invoices.csv

# Output Excel
npx nextsheet build sheets/Invoices.sheet.tsx --target xlsx --out dist/invoices.xlsx

# Output for SuperSheet hosting
npx nextsheet build sheets/Invoices.sheet.tsx --target supersheet
```

### Watch mode

```bash
npx nextsheet dev sheets/Invoices.sheet.tsx
```

Rebuilds on every save. Output lands in `dist/` by default.

### Build multiple sheets into one workbook

```tsx
// In a build script or Next.js API route
import { workbook, csvAdapter } from 'nextsheet'
import Invoices from './sheets/Invoices.sheet.js'
import Expenses from './sheets/Expenses.sheet.js'

const wb = workbook('Finance 2026', [Invoices, Expenses])
const { data } = await csvAdapter.render(wb)
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
import { useFormula, useQuery, useRange } from 'nextsheet'

// useFormula — evaluates a JS expression at build time.
// In v0.2+ it will transpile to a native spreadsheet formula.
const total = useFormula(() => rows.reduce((s, r) => s + r.amount, 0))

// useQuery — chainable in-memory query over any array.
const topRep = useQuery(sales).orderBy('amount', 'desc').first()

// useRange — connects to a live backend (Google Sheets, Excel Online).
// Available in v0.3. Throws during static builds.
const sales = useRange<Sale>('Sales!A2:D')
```

### Charts

NextSheet ships two chart components — `<Chart>` and `<ChartSeries>` — that can be placed anywhere inside a `<Sheet>`. In dev mode (`nextsheet dev`) they render as interactive Chart.js visualizations. Adapters can consume the `charts` array in `SheetNode` to produce native chart output (the XLSX adapter has ExcelJS chart support available).

```tsx
import { Sheet, Column, Section, Row, Cell, Chart, ChartSeries } from 'nextsheet'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
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

      {/* columns reference the sheet data automatically */}
      <Chart type="bar" title="Revenue vs Expenses" xAxis="Month">
        <ChartSeries name="Revenue"  column="Revenue"  color="#22c55e" />
        <ChartSeries name="Expenses" column="Expenses" color="#ef4444" />
      </Chart>
    </Sheet>
  )
}
```

#### Chart types

| Type | Description | Chart.js equivalent |
| --- | --- | --- |
| `bar` | Vertical bars, one bar per series per category | `bar` |
| `horizontal-bar` | Horizontal bars (flips axes) | `bar` + `indexAxis: 'y'` |
| `line` | Line chart with optional data points | `line` |
| `area` | Filled line chart | `line` + `fill: true` |
| `stacked-bar` | Bars stacked on top of each other | `bar` + `stacked` |
| `stacked-area` | Stacked filled lines | `line` + `fill` + `stacked` |
| `pie` | Circular slice chart | `pie` |
| `donut` | Pie with a hollow center | `doughnut` |
| `scatter` | Points at (x, y) coordinates | `scatter` |
| `bubble` | Points with variable radius (x, y, r) | `bubble` |
| `radar` | Spider/radar polygon | `radar` |

#### `<Chart>` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `ChartType` | required | Chart type (see table above) |
| `title` | `string` | — | Chart title displayed above the visualization |
| `xAxis` | `string` | — | Column name to use as x-axis labels |
| `showLegend` | `boolean` | `true` | Show the series legend |
| `width` | `number` | — | Max width in pixels |
| `height` | `number` | `320` | Height in pixels |

#### `<ChartSeries>` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | required | Series label shown in legend and tooltips |
| `column` | `string` | — | Column name in the sheet to read values from |
| `data` | `number[]` | — | Inline array of values (used when `column` is not set) |
| `points` | `ChartPoint[]` | — | Explicit `{x, y, r?}` points for `scatter` / `bubble` |
| `color` | `string` | auto | Hex color or CSS named color |

#### Data sources

Series can pull data from the sheet's columns or use inline arrays:

```tsx
{/* column mode — reads from Column name="Revenue" rows */}
<ChartSeries name="Revenue" column="Revenue" />

{/* inline mode — data is hardcoded in the component */}
<ChartSeries name="Forecast" data={[55_000, 62_000, 70_000]} />

{/* point mode — for scatter and bubble charts */}
<ChartSeries name="Products" points={[
  { x: 10, y: 30, r: 5 },
  { x: 25, y: 50, r: 8 },
  { x: 40, y: 20, r: 3 },
]} />
```

#### Example: every chart type

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
  <ChartSeries name="MAU" data={[1200, 1800, 2400, 3100, 3900]} />
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
  <ChartSeries name="Organic" column="Organic" color="#22c55e" />
  <ChartSeries name="Paid"    column="Paid"    color="#3b82f6" />
  <ChartSeries name="Referral" column="Referral" color="#f97316" />
</Chart>

{/* Pie — part-of-whole */}
<Chart type="pie" title="Market Share" xAxis="Company" showLegend={true}>
  <ChartSeries name="Share" column="Share" />
</Chart>

{/* Donut — same as pie, hollow center */}
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

{/* Bubble — three-variable comparison */}
<Chart type="bubble" title="Revenue / Margin / Volume">
  <ChartSeries name="Products" points={[
    { x: 20, y: 30, r: 5 }, { x: 40, y: 55, r: 12 },
    { x: 60, y: 40, r: 8 }, { x: 80, y: 70, r: 16 },
  ]} />
</Chart>

{/* Radar — multi-axis comparison */}
<Chart type="radar" title="Skill Assessment">
  <ChartSeries name="Alice" data={[85, 92, 78, 95, 80]} color="#3b82f6" />
  <ChartSeries name="Bob"   data={[70, 85, 90, 75, 88]} color="#ef4444" />
</Chart>
```

### Adapters

Adapters are pluggable. Pass a `WorkbookNode` to any adapter to get the output:

```ts
import { workbook, csvAdapter, xlsxAdapter } from 'nextsheet'
import MySheet from './sheets/MySheet.sheet.js'

const wb = workbook('My Report', [MySheet])

const csv  = await csvAdapter.render(wb)   // { mimeType, extension, data: string }
const xlsx = await xlsxAdapter.render(wb)  // { mimeType, extension, data: Buffer }
```

Write your own adapter by implementing the `Adapter` interface:

```ts
import type { Adapter, WorkbookNode, RenderResult } from 'nextsheet'

export class MyAdapter implements Adapter {
  readonly name = 'my-adapter'

  async render(workbook: WorkbookNode): Promise<RenderResult> {
    // traverse workbook.sheets → workbook.sheets[i].sections → rows → cells
    return { mimeType: 'text/plain', extension: 'txt', data: '...' }
  }
}
```

---

## CLI reference

### `nextsheet build`

Compile one or more `.sheet.tsx` files into a spreadsheet output.

```
nextsheet build <files...> [options]

Options:
  -t, --target <target>   csv | xlsx | supersheet  (default: csv)
  -o, --out <path>        Output file path
  -n, --name <name>       Workbook name            (default: Workbook)
```

**Examples:**

```bash
# Single sheet → CSV
nextsheet build sheets/Report.sheet.tsx --target csv --out dist/report.csv

# Single sheet → Excel
nextsheet build sheets/Report.sheet.tsx --target xlsx --out dist/report.xlsx

# Multiple sheets → one workbook
nextsheet build sheets/Invoices.sheet.tsx sheets/Expenses.sheet.tsx \
  --target xlsx --name "Finance 2026" --out dist/finance.xlsx

# For SuperSheet hosting (generates nextsheet.output.json)
nextsheet build sheets/*.sheet.tsx --target supersheet
```

### `nextsheet dev`

Watch mode — rebuild on save.

```
nextsheet dev <files...> [options]

Options:
  -t, --target <target>   csv | xlsx               (default: csv)
  -o, --out-dir <dir>     Output directory          (default: dist)
  -n, --name <name>       Workbook name
```

```bash
nextsheet dev sheets/Report.sheet.tsx --target xlsx
```

### `nextsheet deploy`

Deploy directly to SuperSheet via the Supabase REST API.

```
nextsheet deploy <files...> [options]

Options:
  -t, --target <target>      supersheet (default)
  -n, --name <name>          Workbook name
  --supabase-url <url>       Your Supabase project URL
  --anon-key <key>           Supabase anon key (public)
  --jwt <token>              Your session JWT
  --workbook-id <id>         Update an existing workbook instead of creating one
```

**Environment variables** (alternative to flags):

```bash
export SUPABASE_URL=https://xxxx.supabase.co
export SUPABASE_ANON_KEY=eyJhbGci...
export SUPABASE_JWT=eyJhbGci...   # from browser: see below

nextsheet deploy sheets/*.sheet.tsx --name "Finance 2026"
```

**Getting your JWT from the browser:**

```js
// Open DevTools → Console on your SuperSheet tab
JSON.parse(
  localStorage.getItem(
    Object.keys(localStorage).find(k => k.endsWith('-auth-token'))
  )
).access_token
```

---

## SuperSheet hosting

SuperSheet is the hosted platform for NextSheet — the same relationship Vercel has with Next.js. Your NextSheet project stays in Git; SuperSheet builds, hosts, and lets teams collaborate on the live spreadsheet.

### How to import a NextSheet project into SuperSheet

**Option A — via GitHub (recommended)**

1. Build the SuperSheet output in your project:

   ```bash
   npx nextsheet build sheets/*.sheet.tsx --target supersheet
   # → creates nextsheet.output.json
   ```

2. Commit and push to GitHub:

   ```bash
   git add nextsheet.output.json
   git commit -m "build: update nextsheet output"
   git push
   ```

3. In SuperSheet, click **Add New → NextSheet Project**, enter your repo URL.

   SuperSheet will:
   - Detect `nextsheet.output.json` in the repo
   - Show the workbook name and build timestamp
   - Import it as a live editable workbook with one click

   If the output file is missing but `.sheet.tsx` files are found, SuperSheet shows which files exist and prompts you to run the build step.

**Option B — direct deploy from CLI**

```bash
SUPABASE_URL=https://xxxx.supabase.co \
SUPABASE_ANON_KEY=eyJhbGci... \
SUPABASE_JWT=eyJhbGci... \
npx nextsheet deploy sheets/*.sheet.tsx --name "Finance 2026"
# → Deployed → workbook ID: abc123
```

To update an existing workbook instead of creating a new one:

```bash
nextsheet deploy sheets/*.sheet.tsx --workbook-id abc123
```

### The output format

`nextsheet build --target supersheet` produces a `nextsheet.output.json` file. It is a self-contained snapshot of your workbook as cell-addressed data — the format SuperSheet reads directly:

```json
{
  "_nextsheet": true,
  "version": "0.1",
  "name": "Finance 2026",
  "buildAt": "2026-04-17T03:39:27.067Z",
  "workbookData": {
    "sheets": {
      "Invoices 2026": {
        "A1": { "value": "id",     "format": { "bold": true } },
        "B1": { "value": "client", "format": { "bold": true } },
        "C1": { "value": "amount", "format": { "bold": true, "numberFormat": "currency" } }
      }
    },
    "sheetOrder": ["Invoices 2026"]
  }
}
```

The `_nextsheet: true` flag is how SuperSheet's import dialog distinguishes this file from generic JSON.

---

## What's implemented

### Core runtime — `packages/nextsheet` ✅

| Feature | Status |
| --- | --- |
| Custom JSX runtime (`jsxImportSource: "nextsheet"`) | ✅ Implemented |
| `Sheet` component | ✅ Implemented |
| `Column` component with type system | ✅ Implemented |
| `Row` / `Cell` / `Section` components | ✅ Implemented |
| `Header` component | ✅ Implemented |
| `Formula` component (expression capture) | ✅ Implemented |
| `defineSheet(name, render)` | ✅ Implemented |
| `workbook(name, sheets[])` | ✅ Implemented |
| `useFormula(fn)` — JS evaluation | ✅ Implemented |
| `useQuery(data)` — chainable in-memory query | ✅ Implemented |
| `useRange(address)` — live backend hook | ⏳ v0.3 |
| `Chart` + `ChartSeries` components | ✅ Implemented |
| CSV adapter | ✅ Implemented |
| XLSX adapter (via ExcelJS) | ✅ Implemented |
| SuperSheet adapter | ✅ Implemented |
| Google Sheets adapter | ⏳ v0.3 |
| Excel Online adapter | ⏳ v0.3 |
| Pluggable `Adapter` interface | ✅ Implemented |

### Column types — `ColumnType` ✅

`string` · `number` · `currency` · `boolean` · `date` · `percent`

### Chart types — `ChartType` ✅

`bar` · `horizontal-bar` · `line` · `area` · `stacked-bar` · `stacked-area` · `pie` · `donut` · `scatter` · `bubble` · `radar`

### Cell formatting ✅

`format` · `color` · `bold` · `colspan`

Cell colors: `red` · `green` · `blue` · `yellow` · `orange` · `purple` · `gray` · any hex string

### CLI — `packages/cli` ✅

| Command | Status |
| --- | --- |
| `nextsheet build --target csv` | ✅ Implemented |
| `nextsheet build --target xlsx` | ✅ Implemented |
| `nextsheet build --target supersheet` | ✅ Implemented |
| `nextsheet dev` (watch mode) | ✅ Implemented |
| `nextsheet deploy --target supersheet` | ✅ Implemented |
| `nextsheet deploy --target google` | ⏳ v0.3 |
| `nextsheet deploy --target excel-online` | ⏳ v0.3 |

The CLI transpiles `.sheet.tsx` files via esbuild at runtime — no separate build step required. No `tsx` or `ts-node` needed.

### SuperSheet integration ✅

| Feature | Status |
| --- | --- |
| SuperSheet adapter (IR → WorkbookData JSON) | ✅ Implemented |
| `nextsheet.output.json` output format | ✅ Implemented |
| SuperSheet GitHub import dialog (detects NextSheet repos) | ✅ Implemented |
| "Add New → NextSheet Project" in SuperSheet dashboard | ✅ Implemented |
| Direct CLI deploy via Supabase REST API | ✅ Implemented |
| Auto-detection of `.sheet.tsx` files in repos | ✅ Implemented |
| Re-deploy / update existing workbook | ✅ Implemented |

---

## What's coming

### v0.2 — Formula translation

`useFormula(() => ...)` currently evaluates the JavaScript expression. v0.2 will transpile it to native spreadsheet formulas — Excel `=SUM(B:B)`, Google Sheets `=SUM(B:B)` — so formulas stay live in the spreadsheet after deployment.

Column formulas (`formula={({ amount }) => <Formula>{amount} * 1.21</Formula>}`) will resolve to proper cell-relative references in XLSX output.

### v0.3 — Google Sheets adapter

Full OAuth flow, deploy pipeline, and bidirectional sync. `useRange('Sheet1!A2:D')` reads live data from a connected sheet. `nextsheet deploy --target google --id $SHEET_ID` pushes to Google Sheets from CI.

### v0.4 — Developer tooling

Browser-based live preview. `nextsheet dev` opens a rendered workbook in the browser and hot-reloads as you type — like Storybook for spreadsheets.

### v0.5 — Agent API

A programmatic authoring surface designed for LLMs. Structured output schemas, typed patch operations, and a prompt layer that lets agents author and verify spreadsheets correctly.

### v1.0 — Stable release

Frozen public API. Full documentation site at `nextsheet.dev`. Learn track. Production guarantees.

---

## Monorepo structure

```
nextsheet/
├── packages/
│   ├── nextsheet/           # Core library
│   │   └── src/
│   │       ├── index.ts
│   │       ├── jsx-runtime.ts
│   │       ├── types.ts
│   │       ├── components/  # Sheet, Column, Row, Cell, Section, Header, Formula, Chart, ChartSeries
│   │       ├── hooks/       # useFormula, useQuery, useRange
│   │       ├── runtime/     # defineSheet, workbook
│   │       └── adapters/    # csv, xlsx, supersheet
│   └── cli/                 # nextsheet CLI
│       └── src/
│           ├── index.ts
│           ├── loader.ts    # esbuild-based TSX transpiler
│           └── commands/    # build, dev, deploy
├── examples/
│   ├── invoices/            # Schema-mode sheet (defineSheet + Column)
│   └── quarterly-report/    # Report-mode sheet (function components)
├── tsconfig.base.json
└── pnpm-workspace.yaml
```

## Principles

1. **Developer experience is the product.** Not a feature. Not a pillar. The product.
2. **Types are load-bearing.** A sheet that compiles is a sheet that works.
3. **Convention over configuration.** A `sheets/` directory, zero boilerplate, and it runs.
4. **Portable by default.** The same source compiles to every major spreadsheet surface.
5. **Git is the source of truth.** Everything NextSheet produces is reviewable, revertible, and diffable.
6. **Humans and agents are both first-class authors.** The API is designed for LLMs as deliberately as for humans.
7. **Progressive disclosure.** Easy things take one line. Hard things remain possible.
8. **Open source, forever.** MIT. Public roadmap. RFC-driven. Community-governed.

## Who NextSheet is for

- **Founders and operators** who ship financial models, pricing sheets, and dashboards and want them in Git.
- **Data and analytics engineers** who need to generate formatted, formula-driven workbooks that stakeholders actually open.
- **Finance, RevOps, and BizOps teams** who have outgrown manual sheet maintenance.
- **Platform and infra teams** building internal tooling that produces spreadsheets as outputs.
- **AI engineers and agent builders** who need a typed, declarative surface for LLMs to author structured data.

If you have ever inherited a 47-tab workbook and wished it had been written in code, NextSheet is for you.

## Roadmap

- **v0.0 — RFC phase** ✅ Core API proposal, component model RFC, adapter interface RFC.
- **v0.1 — Core runtime** ✅ `defineSheet`, primitive components, CSV + XLSX + SuperSheet adapters, CLI (`build`, `dev`, `deploy`), SuperSheet hosting integration.
- **v0.2 — Formula translation** ⏳ Native spreadsheet formula output (`=SUM`, `=MULTIPLY`), cell-relative references in XLSX.
- **v0.3 — Google Sheets adapter** ⏳ OAuth, deploy pipeline, two-way sync, `useRange` hook.
- **v0.4 — Developer tooling** ⏳ `nextsheet dev` browser preview, hot reload.
- **v0.5 — Agent API** ⏳ Programmatic authoring surface designed for LLMs and autonomous editors.
- **v1.0 — Stable release** ⏳ Frozen public API, full documentation, learn track, production guarantees.

## The platform

A framework is the beginning. The surface area of the spreadsheet — authoring, collaboration, scheduling, distribution, governance — is vast, and most of it is still unbuilt in open source.

The NextSheet framework is MIT and will remain MIT. Over time, we intend to build a hosted platform on top of it for teams that want managed deploys, scheduled refreshes, access control, audit trails, and collaborative editing of code-defined workbooks — the way Vercel did for Next.js.

The framework is the foundation. The platform is how we sustain building it for the long run. Both are open in development, and the core will never move behind a paywall.

## Community

NextSheet is being designed in public. The earliest contributors have the most leverage over where it goes.

- **GitHub Discussions** — RFCs, API design, open questions, architectural debates.
- **Issues** — Bugs, features, scoped tasks.
- **Discord** — Real-time conversation with maintainers and contributors. *(launching soon)*
- **X / Twitter** — Release notes, weekly updates, and technical writing. *(launching soon)*

If you are excited about this and want to help shape it, open a Discussion and introduce yourself. We read every one.

## Contributing

NextSheet welcomes contributions from developers at every level. In the current phase, a well-argued RFC moves the project as much as a pull request does.

Strong places to start:

- Open or comment on an **RFC** in Discussions.
- Pick up a `good first issue` in the tracker.
- Write a **recipe** demonstrating NextSheet solving a real workflow.
- Build a new **adapter** (Notion, Airtable, Postgres, Parquet…).
- Improve documentation, examples, or the learn track.
- Help shape the brand, the website, or the visual identity.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full guide and [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) for community standards.

## Authors

NextSheet is built by a distributed community of contributors. The project is stewarded by its maintainers and governed through public RFCs. A living list of contributors is maintained in [`AUTHORS.md`](./AUTHORS.md).

If NextSheet becomes what we believe it can become, the people who showed up in the first year will have built it.

## License

NextSheet is [MIT licensed](./LICENSE). Use it, fork it, build a company on it.

---

<div align="center">
  <sub>The spreadsheet runs the world. It is time it had a framework worthy of its scale.</sub>
</div>
