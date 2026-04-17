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
    <a href="#how-it-works">How it works</a> ·
    <a href="#documentation">Documentation</a> ·
    <a href="#the-platform">Platform</a> ·
    <a href="#community">Community</a>
  </p>

  <p>
    <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-000000.svg?style=flat-square" />
    <img alt="Status" src="https://img.shields.io/badge/status-RFC-000000.svg?style=flat-square" />
    <img alt="TypeScript" src="https://img.shields.io/badge/typescript-strict-000000.svg?style=flat-square" />
  </p>
</div>

---

## The thesis

The spreadsheet is the most successful programming model ever shipped. It runs the world's finance, operations, science, and supply chains. It is the default interface humans reach for when data needs structure. And it has scaled to a billion users without a framework, a component model, a type system, or a deploy target.

Every other discipline of software has had its inflection point. The web had React. The backend had Rails, then Next.js, then the edge. Data had dbt. Design had Figma. The spreadsheet — the single most-used piece of structured software on Earth — is still authored the way it was in 1985.

NextSheet is the bet that this ends now.

We are building the open source framework for authoring spreadsheets the way modern software is built: as components, with end-to-end types, composed from primitives, versioned in Git, deployed to any backend, and authored by humans and agents alike. One codebase, any surface — Google Sheets, Excel, `.xlsx`, CSV, and whatever comes next.

The spreadsheet deserves a runtime worthy of its scale. We are building it in the open.

## What you get

- **A component model.** Sheets, Sections, Rows, Cells, and Columns compose like React elements. Reusable, typed, testable.
- **End-to-end types.** Columns, formulas, ranges, and cross-sheet references are fully typed. The compiler catches broken references before your CFO does.
- **Backend-agnostic core.** One codebase compiles to Google Sheets, Excel Online, `.xlsx`, or CSV through a pluggable adapter layer.
- **Git-native workflows.** Sheets are source. They diff, merge, and ship through pull requests.
- **Hot reload.** A dev server that previews your workbook as you type.
- **Agent-ready by design.** Typed schemas and declarative components are the ideal surface for LLMs to author, edit, and verify spreadsheets correctly.
- **Progressive disclosure.** A one-file sheet stays one file. A thousand-sheet finance system stays coherent.

## How it works

> The examples below describe the target API. NextSheet is in the RFC phase and the community is actively shaping it. Join the [Discussions](#community) to contribute.

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
import { Sheet, Section, Row, Cell, Header } from 'nextsheet'

export default function QuarterlyReport({ regions }: Props) {
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
    </Sheet>
  )
}
```

### Live data, typed ranges, declarative formulas

```tsx
import { useRange, useFormula, useQuery } from 'nextsheet'

function SalesSummary() {
  const sales  = useRange<Sale>('Sales!A2:D')
  const total  = useFormula(() => sum(sales.map((s) => s.amount)))
  const topRep = useQuery(sales).orderBy('amount', 'desc').first()

  return (
    <Section title="Summary">
      <Row><Cell>Total revenue</Cell><Cell format="currency">{total}</Cell></Row>
      <Row><Cell>Top sales rep</Cell><Cell>{topRep?.name}</Cell></Row>
    </Section>
  )
}
```

### One command to ship

```bash
npx nextsheet build  --target xlsx         --out ./dist/report.xlsx
npx nextsheet deploy --target google       --id  $SHEET_ID
npx nextsheet deploy --target excel-online --workbook finance.xlsx
```

One codebase. Any backend. Fully typed. Reviewable in a pull request. Deployable from CI.

## Principles

These are the constraints we hold ourselves to. When the framework gets something wrong, it is usually because we violated one of them.

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

## Documentation

| Section           | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| Introduction      | What NextSheet is and the problem it solves.                             |
| Core concepts     | Sheets, sections, rows, cells, columns, and formulas.                    |
| Type system       | End-to-end typing for columns, ranges, and cross-sheet references.       |
| Adapters          | Targeting Google Sheets, Excel Online, `.xlsx`, and CSV.                 |
| Hooks             | `useRange`, `useFormula`, `useQuery`, and data composition.              |
| CLI               | `build`, `deploy`, `dev`, and configuration.                             |
| Agents            | Authoring and editing NextSheet projects with LLMs.                      |
| Recipes           | Dashboards, invoices, rosters, financial models, ETL outputs.            |

Documentation will live at `nextsheet.dev` when the first release lands. Until then, RFCs in [Discussions](#community) are the source of truth.

## Roadmap

NextSheet is being built in the open. Early contributors shape the framework's surface area directly.

- **v0.0 — RFC phase (current).** Core API proposal, component model RFC, adapter interface RFC.
- **v0.1 — Core runtime.** `defineSheet`, primitive components, column and formula type system, CSV adapter.
- **v0.2 — Excel adapter.** `.xlsx` output with formatting, formulas, and styling primitives.
- **v0.3 — Google Sheets adapter.** OAuth, deploy pipeline, two-way sync.
- **v0.4 — Developer tooling.** `nextsheet dev`, hot reload, browser-based live preview.
- **v0.5 — Agent API.** Programmatic authoring surface designed for LLMs and autonomous editors.
- **v1.0 — Stable release.** Frozen public API, full documentation, learn track, production guarantees.

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