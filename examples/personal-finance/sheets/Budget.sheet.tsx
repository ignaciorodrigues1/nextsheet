import {
  defineSheet, Sheet, Header,
  Column, Formula, Section, Row, Cell,
  Chart, ChartSeries,
  useQuery,
} from 'nextsheet'

interface BudgetRow {
  category:  string
  budgeted:  number
  actual:    number
  remaining: number
  pctUsed:   number
  status:    string
}

const budget: BudgetRow[] = [
  { category: 'Rent / Mortgage', budgeted: 2_200, actual: 2_200, remaining:   0,   pctUsed: 100, status: 'On target' },
  { category: 'Groceries',       budgeted:   700, actual:   638, remaining:  62,   pctUsed:  91, status: 'On target' },
  { category: 'Dining Out',      budgeted:   300, actual:   412, remaining: -112,  pctUsed: 137, status: 'Over budget' },
  { category: 'Transport',       budgeted:   450, actual:   388, remaining:  62,   pctUsed:  86, status: 'On target' },
  { category: 'Health & Gym',    budgeted:   250, actual:   210, remaining:  40,   pctUsed:  84, status: 'On target' },
  { category: 'Entertainment',   budgeted:   200, actual:   289, remaining: -89,   pctUsed: 145, status: 'Over budget' },
  { category: 'Subscriptions',   budgeted:   120, actual:   143, remaining: -23,   pctUsed: 119, status: 'Over budget' },
  { category: 'Shopping',        budgeted:   400, actual:   316, remaining:  84,   pctUsed:  79, status: 'Under budget' },
  { category: 'Utilities',       budgeted:   200, actual:   187, remaining:  13,   pctUsed:  94, status: 'On target' },
  { category: 'Education',       budgeted:   150, actual:   150, remaining:   0,   pctUsed: 100, status: 'On target' },
  { category: 'Emergency Fund',  budgeted:   500, actual:   500, remaining:   0,   pctUsed: 100, status: 'On target' },
  { category: 'Investments',     budgeted: 1_500, actual: 1_500, remaining:   0,   pctUsed: 100, status: 'On target' },
]

const totalBudgeted = budget.reduce((s, r) => s + r.budgeted, 0)
const totalActual   = budget.reduce((s, r) => s + r.actual, 0)
const overBudget    = budget.filter(r => r.pctUsed > 100)

export default defineSheet('Budget', () => {
  const onTrack  = useQuery(budget).where('pctUsed', '<=', 100).toArray()
  const overBudgetRows = useQuery(budget).where('pctUsed', '>', 100).orderBy('pctUsed', 'desc').toArray()

  return (
    <Sheet>
      <Header
        title="Monthly Budget — June 2026"
        subtitle={`Budgeted $${totalBudgeted.toLocaleString()} · Spent $${totalActual.toLocaleString()} · ${overBudget.length} categories over budget`}
      />

      <Column name="category"  type="string"   primary />
      <Column name="budgeted"  type="currency" currency="USD" />
      <Column name="actual"    type="currency" currency="USD" />
      <Column name="remaining" type="currency" currency="USD" />
      <Column name="pctUsed"   type="number"   format="#,##0.0" />
      <Column name="status"    type="string" />

      <Section title="All Categories">
        {budget.map(r => (
          <Row key={r.category}>
            <Cell bold>{r.category}</Cell>
            <Cell>{r.budgeted}</Cell>
            <Cell>{r.actual}</Cell>
            <Cell color={r.remaining < 0 ? 'red' : r.remaining === 0 ? 'yellow' : 'green'}>
              {r.remaining}
            </Cell>
            <Cell color={r.pctUsed > 120 ? 'red' : r.pctUsed > 100 ? 'orange' : 'green'}>
              {r.pctUsed}
            </Cell>
            <Cell color={r.status === 'Over budget' ? 'red' : r.status === 'Under budget' ? 'green' : undefined}>
              {r.status}
            </Cell>
          </Row>
        ))}
      </Section>

      <Section title="⚠ Over Budget">
        {overBudgetRows.map(r => (
          <Row key={r.category}>
            <Cell bold color="red">{r.category}</Cell>
            <Cell>{r.budgeted}</Cell>
            <Cell>{r.actual}</Cell>
            <Cell color="red">{r.remaining}</Cell>
            <Cell color="red">{r.pctUsed}</Cell>
            <Cell color="red">{r.status}</Cell>
          </Row>
        ))}
      </Section>

      <Section title="✓ On Track">
        {onTrack.map(r => (
          <Row key={r.category}>
            <Cell bold color="green">{r.category}</Cell>
            <Cell>{r.budgeted}</Cell>
            <Cell>{r.actual}</Cell>
            <Cell color="green">{r.remaining}</Cell>
            <Cell>{r.pctUsed}</Cell>
            <Cell color="green">{r.status}</Cell>
          </Row>
        ))}
      </Section>

      {/* Budget vs Actual horizontal bar */}
      <Chart type="horizontal-bar" title="Budget vs Actual by Category" showLegend width={960} height={420}>
        <ChartSeries name="Budgeted" data={budget.map(r => r.budgeted)} color="#94a3b8" />
        <ChartSeries name="Actual"   data={budget.map(r => r.actual)}   color="#0f766e" />
      </Chart>

      {/* Spending allocation donut */}
      <Chart type="donut" title="Actual Spending Allocation" showLegend height={340}>
        {budget.map(r => (
          <ChartSeries key={r.category} name={r.category} data={[r.actual]} />
        ))}
      </Chart>
    </Sheet>
  )
})
