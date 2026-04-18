# create-nextsheet-app

Scaffold a new [NextSheet](https://github.com/ignaciorodrigues1/nextsheet) workbook project in seconds.

## Usage

```bash
npx create-nextsheet-app
# or
pnpm create nextsheet-app
# or
yarn create nextsheet-app
# or
bun create nextsheet-app
```

Pass a project name to skip the first prompt:

```bash
npx create-nextsheet-app my-workbook
```

Use `--yes` to accept all recommended defaults without any prompts:

```bash
npx create-nextsheet-app my-workbook --yes
```

## Interactive prompts

```
┌  create-nextsheet-app

◆  What is your project named?
│  my-workbook

◆  How would you like to set up your project?
│  ● Use recommended defaults  (TypeScript · ESLint · example sheets)
│  ○ Customize settings
```

Choosing **Customize settings** unlocks:

```
◆  Would you like to use TypeScript?       Yes / No
◆  Which linter?                           ESLint / Biome / None
◆  Would you like example sheets?          Yes / No
◆  Would you like a live backend?          None / Google Sheets / Excel Online
◆  Which package manager?                  pnpm / npm / yarn / bun
◆  Install dependencies now?              Yes / No
```

## What gets created

```
my-workbook/
├── sheets/
│   └── Sales.sheet.tsx     ← example with columns, sections, chart, useQuery
├── .env.example            ← reference for all supported env vars
├── .env.local              ← your local secrets (gitignored)
├── .gitignore
├── tsconfig.json           ← jsxImportSource: "nextsheet" preconfigured
├── eslint.config.js        ← (or biome.json, depending on your choice)
├── README.md
└── package.json
```

### `package.json` scripts

| Script | What it does |
|---|---|
| `dev` | Start the live preview at `http://localhost:3000` |
| `build` | Compile to `.xlsx` in `dist/` |
| `build:csv` | Compile to `.csv` in `dist/` |
| `deploy` | Push to SuperSheet |
| `deploy:google` | Push to Google Sheets *(if Google backend was selected)* |
| `deploy:excel` | Push to Excel Online *(if Excel backend was selected)* |
| `lint` | Run ESLint or Biome |
| `typecheck` | `tsc --noEmit` *(TypeScript only)* |

## Environment variables

The generated project ships with `.env.example` and an empty `.env.local` (gitignored). Copy and fill in your credentials:

```bash
cp .env.example .env.local
```

`nextsheet-cli` loads `.env` files automatically with the same priority model as Next.js:

| File | When loaded |
|---|---|
| `.env` | Always |
| `.env.development` | `nextsheet dev` only |
| `.env.production` | `nextsheet build` and `nextsheet deploy` only |
| `.env.local` | Always — highest priority, gitignored |

Access variables in your sheets via `process.env`:

```ts
// sheets/Sales.sheet.tsx
const apiKey = process.env.MY_API_KEY
```

## Live backends

If you selected **Google Sheets** or **Excel Online**, the generated `.env.local` includes the relevant placeholders:

```sh
# Google Sheets
GOOGLE_SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_KEY=   # JSON key from Google Cloud Console
# or: GOOGLE_ACCESS_TOKEN=

# Excel Online
EXCEL_DRIVE_ITEM_ID=
MICROSOFT_ACCESS_TOKEN=
```

Once filled in, `useRange()` in your sheets fetches live data automatically:

```ts
import { useRange } from 'nextsheet'

const rows = useRange<{ product: string; qty: number }>('Sheet1!A2:B')
```

## Options

| Flag | Description |
|---|---|
| `--yes`, `-y` | Use recommended defaults, skip all prompts |
| `--help`, `-h` | Show usage information |

## Recommended defaults

| Setting | Default |
|---|---|
| TypeScript | Yes |
| Linter | ESLint |
| Example sheets | Yes |
| Backend | None |
| Package manager | Auto-detected from the invocation |

## Requirements

- Node.js 18+
