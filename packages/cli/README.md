# @nextsheet/cli

> CLI for the NextSheet framework — build, preview, and deploy spreadsheets as code.

```bash
npm install -g @nextsheet/cli
# or use without installing
npx nextsheet <command>
```

---

## Commands

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

# For SuperSheet hosting
nextsheet build sheets/*.sheet.tsx --target supersheet
# → creates nextsheet.output.json at project root
```

---

### `nextsheet dev`

Start a live browser preview at `localhost:3000`. Watches for file changes and hot-reloads the page automatically.

```
nextsheet dev <files...> [options]

Options:
  -p, --port <port>   Port to listen on  (default: 3000)
  -n, --name <name>   Workbook name
```

```bash
nextsheet dev sheets/Report.sheet.tsx
nextsheet dev sheets/*.sheet.tsx --name "Finance 2026" --port 4000
```

The preview renders a fully formatted spreadsheet in the browser — sheet tabs, column headers, cell formatting, section titles — and reloads instantly on every save. Build errors appear as a toast without losing the last good preview.

---

### `nextsheet deploy`

Deploy a workbook directly to SuperSheet via the Supabase REST API.

```
nextsheet deploy <files...> [options]

Options:
  -t, --target <target>      supersheet (default)
  -n, --name <name>          Workbook name
  --supabase-url <url>       Supabase project URL
  --anon-key <key>           Supabase anon key
  --jwt <token>              Your session JWT
  --workbook-id <id>         Update an existing workbook
```

**Using environment variables (recommended):**

```bash
export SUPABASE_URL=https://xxxx.supabase.co
export SUPABASE_ANON_KEY=eyJhbGci...
export SUPABASE_JWT=eyJhbGci...

nextsheet deploy sheets/*.sheet.tsx --name "Finance 2026"
# → Deployed → workbook ID: abc123

# Update an existing workbook
nextsheet deploy sheets/*.sheet.tsx --workbook-id abc123
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

## How it works

The CLI uses **esbuild** to transpile `.sheet.tsx` files at runtime — no separate build step, no `ts-node` or `tsx` required. Each file is bundled with the `nextsheet` core, written to a temp file, and dynamic-imported. This means you can run `nextsheet build` directly against TypeScript source.

---

## Related

- [`nextsheet`](https://www.npmjs.com/package/nextsheet) — core library (components, hooks, adapters)
- [GitHub](https://github.com/nextsheet/nextsheet) — source, examples, and RFCs

## License

MIT
