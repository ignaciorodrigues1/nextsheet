import {
  Sheet, Section, Row, Cell, Header,
  Column, Chart, ChartSeries,
  useQuery, useFormula,
} from 'nextsheet'

interface Region {
  id: string
  name: string
  q1: number
  q2: number
  q3: number
  q4: number
}

const regions: Region[] = [
  { id: 'north', name: 'North', q1: 520_000, q2: 610_000, q3: 580_000, q4: 720_000 },
  { id: 'south', name: 'South', q1: 310_000, q2: 340_000, q3: 390_000, q4: 420_000 },
  { id: 'east',  name: 'East',  q1: 480_000, q2: 460_000, q3: 510_000, q4: 550_000 },
  { id: 'west',  name: 'West',  q1: 390_000, q2: 430_000, q3: 475_000, q4: 500_000 },
]

const monthlyRevenue = [
  { month: 'Jan', revenue: 180_000, expenses: 120_000 },
  { month: 'Feb', revenue: 210_000, expenses: 140_000 },
  { month: 'Mar', revenue: 195_000, expenses: 130_000 },
  { month: 'Apr', revenue: 250_000, expenses: 160_000 },
  { month: 'May', revenue: 230_000, expenses: 150_000 },
  { month: 'Jun', revenue: 270_000, expenses: 175_000 },
]

export default function RevenueWithCharts() {
  const topReg = useQuery(regions).orderBy('q4', 'desc').first()
  const totalQ4 = useFormula(() => regions.reduce((s, r) => s + r.q4, 0))

  return (
    <Sheet name="Revenue Charts">
      <Header title="Annual Revenue Report" subtitle="Quarterly breakdown by region — 2025" />

      <Column name="Region"   type="string" primary />
      <Column name="Q1"       type="currency" />
      <Column name="Q2"       type="currency" />
      <Column name="Q3"       type="currency" />
      <Column name="Q4"       type="currency" />

      <Section title="Quarterly breakdown">
        {regions.map((r) => (
          <Row key={r.id}>
            <Cell>{r.name}</Cell>
            <Cell>{r.q1}</Cell>
            <Cell>{r.q2}</Cell>
            <Cell>{r.q3}</Cell>
            <Cell>{r.q4}</Cell>
          </Row>
        ))}
      </Section>

      <Section title="Summary">
        <Row>
          <Cell bold>Top region (Q4)</Cell>
          <Cell colspan={4}>{topReg?.name}</Cell>
        </Row>
        <Row>
          <Cell bold>Total Q4 revenue</Cell>
          <Cell colspan={4} format="currency">{totalQ4}</Cell>
        </Row>
      </Section>

      {/* Bar chart: Q4 revenue per region from column data */}
      <Chart type="bar" title="Q4 Revenue by Region" xAxis="Region">
        <ChartSeries name="Q4 Revenue" column="Q4" color="#3b82f6" />
      </Chart>

      {/* Line chart: quarterly trend per region using inline data */}
      <Chart type="line" title="Quarterly Trend — All Regions">
        {regions.map((r) => (
          <ChartSeries
            key={r.id}
            name={r.name}
            data={[r.q1, r.q2, r.q3, r.q4]}
          />
        ))}
      </Chart>

      {/* Area chart: monthly revenue vs expenses */}
      <Chart type="area" title="Monthly Revenue vs Expenses" xAxis="Month">
        <ChartSeries name="Revenue"  column="Revenue"  color="#22c55e" />
        <ChartSeries name="Expenses" column="Expenses" color="#ef4444" />
      </Chart>
    </Sheet>
  )
}
