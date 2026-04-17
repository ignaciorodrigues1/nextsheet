import {
  Sheet, Header, Column, Section, Row, Cell,
  Chart, ChartSeries,
  useFormula, useQuery,
} from 'nextsheet'

interface Region {
  id: string
  name: string
  q1: number
  q2: number
  q3: number
  revenue: number
  growth: number
}

const regions: Region[] = [
  { id: 'north', name: 'North', q1: 180_000, q2: 195_000, q3: 210_000, revenue: 520_000, growth: 0.12 },
  { id: 'south', name: 'South', q1: 100_000, q2: 105_000, q3: 115_000, revenue: 310_000, growth: 0.08 },
  { id: 'east',  name: 'East',  q1: 160_000, q2: 155_000, q3: 165_000, revenue: 480_000, growth: -0.03 },
  { id: 'west',  name: 'West',  q1: 120_000, q2: 130_000, q3: 145_000, revenue: 390_000, growth: 0.21 },
]

export default function QuarterlyReport() {
  const total  = useFormula(() => regions.reduce((s, r) => s + r.revenue, 0))
  const topReg = useQuery(regions).orderBy('revenue', 'desc').first()

  return (
    <Sheet name="Q1–Q3 Report">
      <Header title="Quarterly Revenue Report" subtitle="January — September 2026" />

      <Column name="Region"  type="string"   primary />
      <Column name="Q1"      type="currency" />
      <Column name="Q2"      type="currency" />
      <Column name="Q3"      type="currency" />
      <Column name="Total"   type="currency" />
      <Column name="Growth"  type="percent"  />

      <Section title="Revenue by region">
        {regions.map((r) => (
          <Row key={r.id}>
            <Cell>{r.name}</Cell>
            <Cell>{r.q1}</Cell>
            <Cell>{r.q2}</Cell>
            <Cell>{r.q3}</Cell>
            <Cell>{r.revenue}</Cell>
            <Cell color={r.growth > 0 ? 'green' : 'red'}>{r.growth}</Cell>
          </Row>
        ))}
      </Section>

      <Section title="Summary">
        <Row>
          <Cell bold>Total revenue</Cell>
          <Cell colspan={5} format="currency">{total}</Cell>
        </Row>
        <Row>
          <Cell bold>Top region</Cell>
          <Cell colspan={5}>{topReg?.name}</Cell>
        </Row>
      </Section>

      {/* Total revenue per region */}
      <Chart type="bar" title="Total Revenue by Region" xAxis="Region" height={300}>
        <ChartSeries name="Total Revenue" column="Total" color="#6366f1" />
      </Chart>

      {/* Quarterly trend per region — inline data since columns are totals */}
      <Chart type="line" title="Quarterly Trend by Region" height={300}>
        {regions.map((r) => (
          <ChartSeries key={r.id} name={r.name} data={[r.q1, r.q2, r.q3]} />
        ))}
      </Chart>

      {/* Growth comparison — horizontal bar */}
      <Chart type="horizontal-bar" title="Growth Rate by Region" xAxis="Region" height={200}>
        <ChartSeries name="Growth %" column="Growth" color="#22c55e" />
      </Chart>

      {/* Q1 vs Q2 vs Q3 stacked — see contribution per quarter */}
      <Chart type="stacked-bar" title="Quarterly Breakdown (Stacked)" xAxis="Region" height={300}>
        <ChartSeries name="Q1" column="Q1" color="#3b82f6" />
        <ChartSeries name="Q2" column="Q2" color="#6366f1" />
        <ChartSeries name="Q3" column="Q3" color="#a855f7" />
      </Chart>

      {/* Revenue share — donut */}
      <Chart type="donut" title="Revenue Share by Region" xAxis="Region" height={300} width={460}>
        <ChartSeries name="Revenue" column="Total" />
      </Chart>
    </Sheet>
  )
}
