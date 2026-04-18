import {
  defineSheet, Sheet, Header,
  Column, Section, Row, Cell,
  Chart, ChartSeries,
  useQuery,
} from 'nextsheet'

// ─── Monthly P&L data ─────────────────────────────────────────────────────────

interface MonthSummary {
  month: string
  income: number
  expenses: number
  savings: number
  savingsRate: number
}

const monthly: MonthSummary[] = [
  { month: 'Jan', income: 8_500, expenses: 5_820, savings: 2_680, savingsRate: 31.5 },
  { month: 'Feb', income: 8_500, expenses: 5_210, savings: 3_290, savingsRate: 38.7 },
  { month: 'Mar', income: 9_200, expenses: 6_140, savings: 3_060, savingsRate: 33.3 },
  { month: 'Apr', income: 8_500, expenses: 5_990, savings: 2_510, savingsRate: 29.5 },
  { month: 'May', income: 8_500, expenses: 5_430, savings: 3_070, savingsRate: 36.1 },
  { month: 'Jun', income: 10_800, expenses: 6_870, savings: 3_930, savingsRate: 36.4 },
]

const totalIncome   = monthly.reduce((s, m) => s + m.income, 0)
const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0)
const totalSavings  = monthly.reduce((s, m) => s + m.savings, 0)
const avgSavingsRate = (totalSavings / totalIncome * 100).toFixed(1)

// ─── Top expense categories (aggregated) ─────────────────────────────────────

interface CategorySummary { category: string; amount: number; pct: number }

const categories: CategorySummary[] = [
  { category: 'Housing',       amount: 13_200, pct: 37.6 },
  { category: 'Food',          amount:  4_380, pct: 12.5 },
  { category: 'Transport',     amount:  2_640, pct:  7.5 },
  { category: 'Health',        amount:  1_920, pct:  5.5 },
  { category: 'Entertainment', amount:  1_740, pct:  5.0 },
  { category: 'Subscriptions', amount:    960, pct:  2.7 },
  { category: 'Shopping',      amount:  2_520, pct:  7.2 },
  { category: 'Education',     amount:  1_200, pct:  3.4 },
  { category: 'Utilities',     amount:  1_560, pct:  4.4 },
  { category: 'Other',         amount:  5_340, pct: 14.2 },
]

export default defineSheet('Dashboard', () => {
  const topCategories = useQuery(categories).orderBy('amount', 'desc').limit(5).toArray()

  return (
    <Sheet>
      <Header
        title="Personal Finance Dashboard — 2026"
        subtitle="January → June · Income, savings, investments & net worth at a glance"
      />

      {/* ── KPI summary ───────────────────────────────────────────────── */}
      <Column name="metric" type="string"   primary />
      <Column name="value"  type="currency" currency="USD" />
      <Column name="note"   type="string" />

      <Section title="6-Month Summary (Jan – Jun 2026)">
        <Row><Cell bold>Total Income</Cell>   <Cell>{totalIncome}</Cell>   <Cell>salary + freelance</Cell></Row>
        <Row><Cell bold>Total Expenses</Cell> <Cell>{totalExpenses}</Cell> <Cell>all categories</Cell></Row>
        <Row><Cell bold>Total Savings</Cell>  <Cell>{totalSavings}</Cell>  <Cell>transferred to investment account</Cell></Row>
        <Row><Cell bold>Savings Rate</Cell>   <Cell>{parseFloat(avgSavingsRate)}</Cell><Cell>avg % of income saved</Cell></Row>
        <Row><Cell bold>Net Worth</Cell>      <Cell>148_730</Cell>         <Cell>assets − liabilities</Cell></Row>
        <Row><Cell bold>Investment Value</Cell><Cell>87_420</Cell>         <Cell>stocks + crypto + ETFs</Cell></Row>
        <Row><Cell bold>Total Debt</Cell>     <Cell>24_800</Cell>          <Cell>car loan + student loan</Cell></Row>
        <Row><Cell bold>Emergency Fund</Cell> <Cell>18_500</Cell>          <Cell>covers 3.2 months of expenses</Cell></Row>
      </Section>

      {/* ── Monthly breakdown ─────────────────────────────────────────── */}
      <Section title="Monthly Breakdown">
        <Row header>
          <Cell>Month</Cell><Cell>Income</Cell><Cell>Expenses</Cell>
          <Cell>Savings</Cell><Cell>Savings Rate %</Cell>
        </Row>
        {monthly.map(m => (
          <Row key={m.month}>
            <Cell bold>{m.month}</Cell>
            <Cell>{m.income}</Cell>
            <Cell>{m.expenses}</Cell>
            <Cell color={m.savings > 3_000 ? 'green' : 'yellow'}>{m.savings}</Cell>
            <Cell color={m.savingsRate >= 35 ? 'green' : 'yellow'}>{m.savingsRate}</Cell>
          </Row>
        ))}
      </Section>

      {/* ── Top 5 spending categories ─────────────────────────────────── */}
      <Section title="Top Spending Categories">
        <Row header><Cell>Category</Cell><Cell>6-Month Total</Cell><Cell>% of Expenses</Cell></Row>
        {topCategories.map(c => (
          <Row key={c.category}>
            <Cell>{c.category}</Cell>
            <Cell>{c.amount}</Cell>
            <Cell>{c.pct}</Cell>
          </Row>
        ))}
      </Section>

      {/* ── Cash flow trend ───────────────────────────────────────────── */}
      <Chart type="area" title="Monthly Cash Flow (USD)" xAxis="month" showLegend width={960} height={300}>
        <ChartSeries name="Income"   data={monthly.map(m => m.income)}   color="#0f766e" />
        <ChartSeries name="Expenses" data={monthly.map(m => m.expenses)} color="#e11d48" />
        <ChartSeries name="Savings"  data={monthly.map(m => m.savings)}  color="#0369a1" />
      </Chart>

      {/* ── Spending by category ──────────────────────────────────────── */}
      <Chart type="donut" title="Expenses by Category (6-Month Total)" showLegend height={340}>
        {categories.map(c => (
          <ChartSeries key={c.category} name={c.category} data={[c.amount]} />
        ))}
      </Chart>
    </Sheet>
  )
})
