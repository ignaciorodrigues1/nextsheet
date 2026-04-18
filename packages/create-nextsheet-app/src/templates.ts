import type { ProjectOptions } from './prompts.js'

// ─── package.json ─────────────────────────────────────────────────────────────

export function packageJson(opts: ProjectOptions): string {
  const ext = opts.useTypeScript ? 'tsx' : 'jsx'
  const sheetEntry = `sheets/Sales.sheet.${ext}`

  const devDeps: Record<string, string> = {
    'nextsheet-cli': 'latest',
  }
  if (opts.useTypeScript) devDeps['typescript'] = '^5.4.5'
  if (opts.linter === 'eslint') {
    devDeps['eslint'] = '^9.0.0'
    devDeps['@eslint/js'] = '^9.0.0'
    if (opts.useTypeScript) {
      devDeps['typescript-eslint'] = '^8.0.0'
    }
  }
  if (opts.linter === 'biome') {
    devDeps['@biomejs/biome'] = '^1.9.0'
  }

  const scripts: Record<string, string> = {
    dev: `nextsheet dev ${sheetEntry}`,
    build: `nextsheet build ${sheetEntry} --target xlsx`,
    'build:csv': `nextsheet build ${sheetEntry} --target csv`,
    deploy: `nextsheet deploy ${sheetEntry}`,
  }
  if (opts.backend === 'google') {
    scripts['dev:live'] = `nextsheet dev ${sheetEntry} --google-spreadsheet-id $GOOGLE_SPREADSHEET_ID`
    scripts['deploy:google'] = `nextsheet deploy ${sheetEntry} --target google`
  }
  if (opts.backend === 'excel-online') {
    scripts['dev:live'] = `nextsheet dev ${sheetEntry} --drive-item-id $EXCEL_DRIVE_ITEM_ID`
    scripts['deploy:excel'] = `nextsheet deploy ${sheetEntry} --target excel-online`
  }
  if (opts.linter === 'eslint') scripts['lint'] = 'eslint sheets/'
  if (opts.linter === 'biome') {
    scripts['lint'] = 'biome check sheets/'
    scripts['format'] = 'biome format --write sheets/'
  }
  if (opts.useTypeScript) scripts['typecheck'] = 'tsc --noEmit'

  return JSON.stringify(
    {
      name: opts.name,
      version: '0.1.0',
      type: 'module',
      private: true,
      scripts,
      dependencies: { nextsheet: 'latest' },
      devDependencies: devDeps,
    },
    null,
    2
  )
}

// ─── tsconfig.json ────────────────────────────────────────────────────────────

export function tsconfigJson(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        lib: ['ES2022'],
        jsx: 'react-jsx',
        jsxImportSource: 'nextsheet',
        strict: true,
        noUncheckedIndexedAccess: true,
        noImplicitReturns: true,
        skipLibCheck: true,
      },
      include: ['sheets/**/*', 'nextsheet.config.ts'],
    },
    null,
    2
  )
}

// ─── .gitignore ───────────────────────────────────────────────────────────────

export function gitignore(): string {
  return [
    'node_modules',
    'dist',
    '',
    '# NextSheet build output',
    '.nextsheet/',
    '',
    '# Local env files — never commit these',
    '.env.local',
    '.env.*.local',
    '',
    '# OS',
    '.DS_Store',
    'Thumbs.db',
  ].join('\n') + '\n'
}

// ─── .env.example ────────────────────────────────────────────────────────────

export function envExample(opts: ProjectOptions): string {
  const lines = [
    '# Copy this file to .env.local and fill in your values.',
    '# .env.local is gitignored — never commit secrets.',
    '',
  ]

  if (opts.backend === 'google' || opts.backend === 'none') {
    lines.push(
      '# ── Google Sheets ────────────────────────────────────────────────',
      '# Spreadsheet ID from the URL: /spreadsheets/d/{ID}/edit',
      'GOOGLE_SPREADSHEET_ID=',
      '',
      '# Option A — Service account JSON key (recommended for CI)',
      'GOOGLE_SERVICE_ACCOUNT_KEY=',
      '',
      '# Option B — OAuth2 access token (short-lived, good for local dev)',
      'GOOGLE_ACCESS_TOKEN=',
      '',
    )
  }

  if (opts.backend === 'excel-online' || opts.backend === 'none') {
    lines.push(
      '# ── Excel Online (Microsoft Graph) ──────────────────────────────',
      '# OneDrive item ID of the .xlsx file',
      'EXCEL_DRIVE_ITEM_ID=',
      '',
      '# Microsoft Graph OAuth2 access token',
      'MICROSOFT_ACCESS_TOKEN=',
      '',
    )
  }

  lines.push(
    '# ── Your own variables ───────────────────────────────────────────',
    '# Add any API keys or config your sheets need here.',
    '# Access them in sheets via process.env.MY_VAR',
    'MY_API_BASE_URL=https://api.example.com',
    'MY_API_KEY=',
  )

  return lines.join('\n') + '\n'
}

// ─── .env.local ───────────────────────────────────────────────────────────────

export function envLocal(opts: ProjectOptions): string {
  const lines = [
    '# Local environment — fill in your actual credentials.',
    '# This file is gitignored.',
    '',
  ]

  if (opts.backend === 'google') {
    lines.push('GOOGLE_SPREADSHEET_ID=', 'GOOGLE_SERVICE_ACCOUNT_KEY=', '')
  }
  if (opts.backend === 'excel-online') {
    lines.push('EXCEL_DRIVE_ITEM_ID=', 'MICROSOFT_ACCESS_TOKEN=', '')
  }

  return lines.join('\n') + '\n'
}

// ─── ESLint ───────────────────────────────────────────────────────────────────

export function eslintConfig(opts: ProjectOptions): string {
  if (opts.useTypeScript) {
    return [
      '// @ts-check',
      "import eslint from '@eslint/js'",
      "import tseslint from 'typescript-eslint'",
      '',
      'export default tseslint.config(',
      '  eslint.configs.recommended,',
      '  tseslint.configs.recommended,',
      ')',
      '',
    ].join('\n')
  }
  return [
    '// @ts-check',
    "import eslint from '@eslint/js'",
    '',
    'export default [eslint.configs.recommended]',
    '',
  ].join('\n')
}

// ─── Biome ────────────────────────────────────────────────────────────────────

export function biomeConfig(): string {
  return JSON.stringify(
    {
      $schema: 'https://biomejs.dev/schemas/1.9.0/schema.json',
      organizeImports: { enabled: true },
      linter: {
        enabled: true,
        rules: { recommended: true },
      },
      formatter: {
        enabled: true,
        indentStyle: 'space',
        indentWidth: 2,
      },
    },
    null,
    2
  ) + '\n'
}

// ─── Example sheet ───────────────────────────────────────────────────────────

function exampleSheetTs(): string {
  return `import {
  defineSheet,
  Sheet,
  Header,
  Column,
  Section,
  Row,
  Cell,
  Formula,
  Chart,
  ChartSeries,
  useQuery,
} from 'nextsheet'

// Row type for static sample data.
// When using a live backend, useRange infers this from the spreadsheet headers:
//   const rows = useRange<SaleRow>('Sales!A2:E')
interface SaleRow {
  product: string
  category: string
  qty: number
  price: number
}

const rows: SaleRow[] = [
  { product: 'Widget A', category: 'Electronics', qty: 42,  price: 29.99 },
  { product: 'Widget B', category: 'Electronics', qty: 18,  price: 49.99 },
  { product: 'Gadget X', category: 'Tools',       qty: 76,  price: 14.99 },
  { product: 'Gadget Y', category: 'Tools',       qty: 31,  price: 24.99 },
  { product: 'Part Z',   category: 'Components',  qty: 120, price:  5.99 },
]

export default defineSheet('Sales', () => {
  const top3 = useQuery(rows).orderBy('qty', 'desc').limit(3).toArray()

  return (
    <Sheet>
      <Header title="Sales Report" subtitle="Generated with NextSheet" />

      <Column name="product"  type="string"   primary />
      <Column name="category" type="string" />
      <Column name="qty"      type="number" />
      <Column name="price"    type="currency" currency="USD" />
      <Column
        name="total"
        type="currency"
        formula={({ qty, price }) => <Formula>{qty} * {price}</Formula>}
      />

      <Section title="All Products">
        {rows.map(r => (
          <Row key={r.product}>
            <Cell>{r.product}</Cell>
            <Cell>{r.category}</Cell>
            <Cell>{r.qty}</Cell>
            <Cell>{r.price}</Cell>
          </Row>
        ))}
      </Section>

      <Section title="Top 3 by Quantity">
        {top3.map(r => (
          <Row key={r.product}>
            <Cell>{r.product}</Cell>
            <Cell>{r.category}</Cell>
            <Cell>{r.qty}</Cell>
            <Cell>{r.price}</Cell>
          </Row>
        ))}
      </Section>

      <Chart type="bar" title="Revenue by Product" showLegend>
        <ChartSeries name="Revenue" column="total" />
      </Chart>
    </Sheet>
  )
})
`
}

function exampleSheetJs(): string {
  return `import {
  defineSheet,
  Sheet,
  Header,
  Column,
  Section,
  Row,
  Cell,
  Formula,
  Chart,
  ChartSeries,
  useQuery,
} from 'nextsheet'

// Static sample data. To pull from a live spreadsheet, replace with:
//   const rows = useRange('Sales!A2:E')
const rows = [
  { product: 'Widget A', category: 'Electronics', qty: 42,  price: 29.99 },
  { product: 'Widget B', category: 'Electronics', qty: 18,  price: 49.99 },
  { product: 'Gadget X', category: 'Tools',       qty: 76,  price: 14.99 },
  { product: 'Gadget Y', category: 'Tools',       qty: 31,  price: 24.99 },
  { product: 'Part Z',   category: 'Components',  qty: 120, price:  5.99 },
]

export default defineSheet('Sales', () => {
  const top3 = useQuery(rows).orderBy('qty', 'desc').limit(3).toArray()

  return (
    <Sheet>
      <Header title="Sales Report" subtitle="Generated with NextSheet" />

      <Column name="product"  type="string"   primary />
      <Column name="category" type="string" />
      <Column name="qty"      type="number" />
      <Column name="price"    type="currency" currency="USD" />
      <Column
        name="total"
        type="currency"
        formula={({ qty, price }) => <Formula>{qty} * {price}</Formula>}
      />

      <Section title="All Products">
        {rows.map(r => (
          <Row key={r.product}>
            <Cell>{r.product}</Cell>
            <Cell>{r.category}</Cell>
            <Cell>{r.qty}</Cell>
            <Cell>{r.price}</Cell>
          </Row>
        ))}
      </Section>

      <Section title="Top 3 by Quantity">
        {top3.map(r => (
          <Row key={r.product}>
            <Cell>{r.product}</Cell>
            <Cell>{r.category}</Cell>
            <Cell>{r.qty}</Cell>
            <Cell>{r.price}</Cell>
          </Row>
        ))}
      </Section>

      <Chart type="bar" title="Revenue by Product" showLegend>
        <ChartSeries name="Revenue" column="total" />
      </Chart>
    </Sheet>
  )
})
`
}

export function exampleSheet(opts: ProjectOptions): string {
  return opts.useTypeScript ? exampleSheetTs() : exampleSheetJs()
}

// ─── nextsheet.config.ts ──────────────────────────────────────────────────────

export function nextsheetConfig(): string {
  return `import { defineConfig } from 'nextsheet'

/**
 * NextSheet theme configuration.
 * Similar to tailwind.config.ts — customize colors, typography, and layout.
 * Changes here apply to xlsx output and the HTML dev preview.
 */
export default defineConfig({
  theme: {
    colors: {
      /** Header row background and chart accent color. */
      primary: '#3b82f6',
      /** Page / sheet background (HTML preview). */
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
      /** Default column width (characters in xlsx, proportional in HTML preview). */
      columnWidth: 18,
    },
  },
})
`
}

// ─── README.md ────────────────────────────────────────────────────────────────

export function readme(opts: ProjectOptions): string {
  const ext = opts.useTypeScript ? 'tsx' : 'jsx'
  const sheetFile = `sheets/Sales.sheet.${ext}`
  const pm = opts.packageManager

  const run = (cmd: string) =>
    pm === 'npm' ? `npm run ${cmd}` :
    pm === 'yarn' ? `yarn ${cmd}` :
    `${pm} ${cmd}`

  const lines = [
    `# ${opts.name}`,
    '',
    'A spreadsheet app built with [NextSheet](https://github.com/ignaciorodrigues/nextsheet).',
    '',
    '## Getting started',
    '',
    '```sh',
    `${run('dev')}   # live preview at http://localhost:3000`,
    '```',
    '',
    '## Build',
    '',
    '```sh',
    `${run('build')}       # → dist/*.xlsx`,
    `${run('build:csv')}   # → dist/*.csv`,
    '```',
    '',
    '## Deploy',
    '',
  ]

  if (opts.backend === 'google') {
    lines.push(
      '```sh',
      `${run('deploy:google')}   # → Google Sheets`,
      '```',
      '',
      'Set `GOOGLE_SPREADSHEET_ID` and `GOOGLE_SERVICE_ACCOUNT_KEY` in `.env.local`.',
      '',
    )
  } else if (opts.backend === 'excel-online') {
    lines.push(
      '```sh',
      `${run('deploy:excel')}   # → Excel Online`,
      '```',
      '',
      'Set `EXCEL_DRIVE_ITEM_ID` and `MICROSOFT_ACCESS_TOKEN` in `.env.local`.',
      '',
    )
  } else {
    lines.push(
      '```sh',
      `${run('deploy')}   # → SuperSheet`,
      '```',
      '',
    )
  }

  lines.push(
    '## Environment variables',
    '',
    'Copy `.env.example` → `.env.local` and fill in your credentials.',
    '`.env.local` is gitignored — never commit secrets.',
    '',
    '| File | Purpose |',
    '|---|---|',
    '| `.env` | Base vars, safe to commit |',
    '| `.env.local` | Local overrides, gitignored |',
    '| `.env.development` | Dev-only vars |',
    '| `.env.production` | Build/deploy vars |',
    '',
    'Access in sheets:',
    '',
    '```' + (opts.useTypeScript ? 'ts' : 'js'),
    '// sheets/MySales.sheet.' + ext,
    "const apiKey = process.env.MY_API_KEY",
    '```',
    '',
    '## Project structure',
    '',
    '```',
    `${opts.name}/`,
    '├── sheets/',
    `│   └── Sales.sheet.${ext}   ← your sheet definitions`,
    '├── .env.example              ← variable reference',
    '├── .env.local                ← your local secrets (gitignored)',
    '└── package.json',
    '```',
  )

  return lines.join('\n') + '\n'
}
