import { Sheet, Section, Row, Cell, Header, useQuery, useFormula } from 'nextsheet'

interface Region {
  id: string
  name: string
  revenue: number
  growth: number
}

const regions: Region[] = [
  { id: 'north', name: 'North',  revenue: 520_000, growth: 0.12 },
  { id: 'south', name: 'South',  revenue: 310_000, growth: 0.08 },
  { id: 'east',  name: 'East',   revenue: 480_000, growth: -0.03 },
  { id: 'west',  name: 'West',   revenue: 390_000, growth: 0.21 },
]

export default function QuarterlyReport() {
  const total   = useFormula(() => regions.reduce((s, r) => s + r.revenue, 0))
  const topReg  = useQuery(regions).orderBy('revenue', 'desc').first()

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
        <Row>
          <Cell bold>Total revenue</Cell>
          <Cell format="currency">{total}</Cell>
        </Row>
        <Row>
          <Cell bold>Top region</Cell>
          <Cell>{topReg?.name}</Cell>
        </Row>
      </Section>
    </Sheet>
  )
}
