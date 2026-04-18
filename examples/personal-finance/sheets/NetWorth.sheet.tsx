import {
  defineSheet, Sheet, Header,
  Column, Section, Row, Cell,
  Chart, ChartSeries,
  useQuery,
} from 'nextsheet'

// ─── Assets ───────────────────────────────────────────────────────────────────

interface AssetRow {
  name:     string
  category: string
  value:    number
  liquid:   string
  notes:    string
}

const assets: AssetRow[] = [
  { name: 'Checking Account',    category: 'Cash',        value: 4_820,  liquid: 'Yes', notes: 'Chase — everyday spending' },
  { name: 'High-Yield Savings',  category: 'Cash',        value: 18_500, liquid: 'Yes', notes: '5.1% APY — emergency fund' },
  { name: 'Brokerage (Stocks)',  category: 'Investments', value: 54_310, liquid: 'Yes', notes: 'AAPL, MSFT, NVDA, VOO, URTH' },
  { name: 'Crypto Portfolio',    category: 'Investments', value: 33_110, liquid: 'Yes', notes: 'BTC, ETH, SOL — CoinGecko live' },
  { name: '401(k)',              category: 'Retirement',  value: 38_200, liquid: 'No',  notes: 'Employer match 4% — Fidelity' },
  { name: 'Roth IRA',           category: 'Retirement',  value: 12_400, liquid: 'No',  notes: 'Max contribution 2025 & 2026' },
  { name: 'Vehicle (Tesla M3)', category: 'Physical',    value: 28_000, liquid: 'No',  notes: '2023 model — KBB estimate' },
  { name: 'Personal Items',      category: 'Physical',    value:  5_200, liquid: 'No',  notes: 'Electronics, furniture' },
]

// ─── Liabilities ──────────────────────────────────────────────────────────────

interface LiabilityRow {
  name:          string
  category:      string
  balance:       number
  interestRate:  number
  monthlyPayment: number
  notes:         string
}

const liabilities: LiabilityRow[] = [
  { name: 'Car Loan (Tesla)',  category: 'Auto',    balance: 18_400, interestRate: 4.9, monthlyPayment: 380, notes: '48 months remaining' },
  { name: 'Student Loan',     category: 'Student', balance:  6_400, interestRate: 5.5, monthlyPayment: 210, notes: 'Federal — income-driven' },
  { name: 'Credit Card',      category: 'Revolving', balance:   0,  interestRate: 24.9, monthlyPayment: 0,  notes: 'Paid in full each month' },
]

// ─── Historical net worth (monthly snapshots) ─────────────────────────────────

interface NWSnapshot {
  month:       string
  assets:      number
  liabilities: number
  netWorth:    number
}

const history: NWSnapshot[] = [
  { month: 'Jul 25', assets: 172_400, liabilities: 30_200, netWorth: 142_200 },
  { month: 'Aug 25', assets: 176_800, liabilities: 29_400, netWorth: 147_400 },
  { month: 'Sep 25', assets: 179_200, liabilities: 28_600, netWorth: 150_600 },
  { month: 'Oct 25', assets: 181_100, liabilities: 27_800, netWorth: 153_300 },
  { month: 'Nov 25', assets: 178_900, liabilities: 27_000, netWorth: 151_900 },
  { month: 'Dec 25', assets: 185_500, liabilities: 26_200, netWorth: 159_300 },
  { month: 'Jan 26', assets: 184_200, liabilities: 25_800, netWorth: 158_400 },
  { month: 'Feb 26', assets: 186_700, liabilities: 25_400, netWorth: 161_300 },
  { month: 'Mar 26', assets: 188_900, liabilities: 25_200, netWorth: 163_700 },
  { month: 'Apr 26', assets: 190_100, liabilities: 25_000, netWorth: 165_100 },
  { month: 'May 26', assets: 191_800, liabilities: 24_800, netWorth: 167_000 },
  { month: 'Jun 26', assets: 194_540, liabilities: 24_800, netWorth: 169_740 },
]

const totalAssets      = assets.reduce((s, a) => s + a.value, 0)
const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0)
const netWorth         = totalAssets - totalLiabilities
const debtToAsset      = (totalLiabilities / totalAssets * 100).toFixed(1)

const firstNW  = history[0]?.netWorth ?? netWorth
const nwGrowth = ((netWorth - firstNW) / firstNW * 100).toFixed(1)

export default defineSheet('Net Worth', () => {
  const liquidAssets = useQuery(assets).where('liquid', '==', 'Yes').toArray()
  const illiquid     = useQuery(assets).where('liquid', '==', 'No').toArray()

  const totalLiquid   = liquidAssets.reduce((s, a) => s + a.value, 0)
  const totalIlliquid = illiquid.reduce((s, a) => s + a.value, 0)

  return (
    <Sheet>
      <Header
        title="Net Worth Statement — June 2026"
        subtitle={`Total Assets $${totalAssets.toLocaleString()} · Total Debt $${totalLiabilities.toLocaleString()} · Net Worth $${netWorth.toLocaleString()} · +${nwGrowth}% YoY`}
      />

      {/* ── KPI snapshot ──────────────────────────────────────────────── */}
      <Column name="metric" type="string" primary />
      <Column name="value"  type="currency" currency="USD" />
      <Column name="notes"  type="string" />

      <Section title="Financial Snapshot">
        <Row><Cell bold>Total Assets</Cell>      <Cell>{totalAssets}</Cell>      <Cell>all owned assets at market value</Cell></Row>
        <Row><Cell bold>Liquid Assets</Cell>     <Cell>{totalLiquid}</Cell>      <Cell>cash + brokerage + crypto</Cell></Row>
        <Row><Cell bold>Illiquid Assets</Cell>   <Cell>{totalIlliquid}</Cell>    <Cell>retirement + vehicle + physical</Cell></Row>
        <Row><Cell bold>Total Liabilities</Cell> <Cell>{totalLiabilities}</Cell> <Cell>all outstanding debts</Cell></Row>
        <Row><Cell bold color="green">Net Worth</Cell><Cell bold color="green">{netWorth}</Cell><Cell>assets − liabilities</Cell></Row>
        <Row><Cell bold>Debt-to-Asset Ratio</Cell><Cell>{parseFloat(debtToAsset)}</Cell><Cell>% of assets funded by debt</Cell></Row>
      </Section>

      {/* ── Assets ────────────────────────────────────────────────────── */}
      <Column name="name"     type="string" primary />
      <Column name="category" type="string" />
      <Column name="value"    type="currency" currency="USD" />
      <Column name="liquid"   type="string" />
      <Column name="notes"    type="string" />

      <Section title="Assets">
        <Row header>
          <Cell>Asset</Cell><Cell>Category</Cell><Cell>Value</Cell>
          <Cell>Liquid</Cell><Cell>Notes</Cell>
        </Row>
        {assets.map(a => (
          <Row key={a.name}>
            <Cell bold>{a.name}</Cell>
            <Cell>{a.category}</Cell>
            <Cell bold>{a.value}</Cell>
            <Cell color={a.liquid === 'Yes' ? 'green' : 'gray'}>{a.liquid}</Cell>
            <Cell>{a.notes}</Cell>
          </Row>
        ))}
        <Row>
          <Cell bold>TOTAL ASSETS</Cell><Cell /><Cell bold>{totalAssets}</Cell><Cell /><Cell />
        </Row>
      </Section>

      {/* ── Liabilities ───────────────────────────────────────────────── */}
      <Section title="Liabilities">
        <Row header>
          <Cell>Debt</Cell><Cell>Category</Cell><Cell>Balance</Cell>
          <Cell>Interest Rate %</Cell><Cell>Monthly Payment</Cell><Cell>Notes</Cell>
        </Row>
        {liabilities.map(l => (
          <Row key={l.name}>
            <Cell bold>{l.name}</Cell>
            <Cell>{l.category}</Cell>
            <Cell color="red">{l.balance}</Cell>
            <Cell>{l.interestRate}</Cell>
            <Cell>{l.monthlyPayment}</Cell>
            <Cell>{l.notes}</Cell>
          </Row>
        ))}
        <Row>
          <Cell bold>TOTAL LIABILITIES</Cell><Cell />
          <Cell bold color="red">{totalLiabilities}</Cell>
          <Cell /><Cell /><Cell />
        </Row>
      </Section>

      {/* ── Monthly history ───────────────────────────────────────────── */}
      <Section title="Net Worth History (12 months)">
        <Row header>
          <Cell>Month</Cell><Cell>Assets</Cell><Cell>Liabilities</Cell><Cell>Net Worth</Cell>
        </Row>
        {history.map(h => (
          <Row key={h.month}>
            <Cell bold>{h.month}</Cell>
            <Cell>{h.assets}</Cell>
            <Cell color="red">{h.liabilities}</Cell>
            <Cell bold color="green">{h.netWorth}</Cell>
          </Row>
        ))}
      </Section>

      {/* Net worth growth trend */}
      <Chart type="area" title="Net Worth Growth (12 Months)" xAxis="month" showLegend width={960} height={300}>
        <ChartSeries name="Net Worth"   data={history.map(h => h.netWorth)}   color="#0f766e" />
        <ChartSeries name="Assets"      data={history.map(h => h.assets)}     color="#0369a1" />
        <ChartSeries name="Liabilities" data={history.map(h => h.liabilities)} color="#e11d48" />
      </Chart>

      {/* Asset breakdown donut */}
      <Chart type="donut" title="Asset Allocation" showLegend height={360}>
        {assets.map(a => (
          <ChartSeries key={a.name} name={a.name} data={[a.value]} />
        ))}
      </Chart>

      {/* Liquid vs illiquid bar */}
      <Chart type="bar" title="Liquid vs Illiquid Assets" showLegend height={280}>
        <ChartSeries name="Liquid"   data={[totalLiquid]}   color="#0f766e" />
        <ChartSeries name="Illiquid" data={[totalIlliquid]} color="#94a3b8" />
      </Chart>
    </Sheet>
  )
})
