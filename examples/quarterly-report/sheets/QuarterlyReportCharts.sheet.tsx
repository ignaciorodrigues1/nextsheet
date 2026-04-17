/**
 * Chart type showcase — one sheet per chart type.
 * Run with: nextsheet dev sheets/QuarterlyReportCharts.sheet.tsx
 */
import { workbook, defineSheet, Sheet, Header, Column, Section, Row, Cell, Chart, ChartSeries } from 'nextsheet'

// ─── Shared data ──────────────────────────────────────────────────────────────

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const revenue  = [42_000, 58_000, 51_000, 67_000, 73_000, 88_000]
const expenses = [28_000, 33_000, 30_000, 38_000, 41_000, 45_000]
const profit   = revenue.map((r, i) => r - (expenses[i] ?? 0))

const channels = ['Organic', 'Paid', 'Referral', 'Direct']
const traffic  = [
  [4200, 5100, 4800, 5600, 6200, 7100],
  [1800, 2400, 2100, 2900, 3100, 3600],
  [900,  1100, 1000, 1300, 1400, 1600],
  [600,  700,  650,  800,  900,  1000],
]

// ─── Bar ─────────────────────────────────────────────────────────────────────

const barSheet = defineSheet('Bar', () => (
  <Sheet name="Bar">
    <Header title="Bar Chart" subtitle="Grouped vertical bars — compare values across categories" />
    <Column name="Month"    type="string"   primary />
    <Column name="Revenue"  type="currency" />
    <Column name="Expenses" type="currency" />
    <Section>
      {months.map((m, i) => (
        <Row key={m}>
          <Cell>{m}</Cell><Cell>{revenue[i]}</Cell><Cell>{expenses[i]}</Cell>
        </Row>
      ))}
    </Section>
    <Chart type="bar" title="Revenue vs Expenses" xAxis="Month" height={320}>
      <ChartSeries name="Revenue"  column="Revenue"  color="#22c55e" />
      <ChartSeries name="Expenses" column="Expenses" color="#ef4444" />
    </Chart>
  </Sheet>
))

// ─── Horizontal bar ───────────────────────────────────────────────────────────

const hBarSheet = defineSheet('Horizontal Bar', () => (
  <Sheet name="Horizontal Bar">
    <Header title="Horizontal Bar Chart" subtitle="Flipped axes — ideal for rankings and long category names" />
    <Column name="Channel"    type="string"  primary />
    <Column name="Conversions" type="number" />
    <Section>
      <Row><Cell>Organic</Cell><Cell>1840</Cell></Row>
      <Row><Cell>Paid Search</Cell><Cell>1230</Cell></Row>
      <Row><Cell>Social</Cell><Cell>980</Cell></Row>
      <Row><Cell>Email</Cell><Cell>760</Cell></Row>
      <Row><Cell>Referral</Cell><Cell>540</Cell></Row>
      <Row><Cell>Direct</Cell><Cell>420</Cell></Row>
    </Section>
    <Chart type="horizontal-bar" title="Conversions by Channel" xAxis="Channel" height={280}>
      <ChartSeries name="Conversions" column="Conversions" color="#6366f1" />
    </Chart>
  </Sheet>
))

// ─── Line ─────────────────────────────────────────────────────────────────────

const lineSheet = defineSheet('Line', () => (
  <Sheet name="Line">
    <Header title="Line Chart" subtitle="Trend over time — good for continuous data" />
    <Column name="Month"   type="string"   primary />
    <Column name="Revenue" type="currency" />
    <Column name="Profit"  type="currency" />
    <Section>
      {months.map((m, i) => (
        <Row key={m}>
          <Cell>{m}</Cell><Cell>{revenue[i]}</Cell><Cell>{profit[i]}</Cell>
        </Row>
      ))}
    </Section>
    <Chart type="line" title="Revenue & Profit Trend" xAxis="Month" height={300}>
      <ChartSeries name="Revenue" column="Revenue" color="#3b82f6" />
      <ChartSeries name="Profit"  column="Profit"  color="#22c55e" />
    </Chart>
  </Sheet>
))

// ─── Area ─────────────────────────────────────────────────────────────────────

const areaSheet = defineSheet('Area', () => (
  <Sheet name="Area">
    <Header title="Area Chart" subtitle="Filled line — emphasises volume and cumulative growth" />
    <Column name="Month"   type="string"   primary />
    <Column name="Revenue" type="currency" />
    <Section>
      {months.map((m, i) => (
        <Row key={m}><Cell>{m}</Cell><Cell>{revenue[i]}</Cell></Row>
      ))}
    </Section>
    <Chart type="area" title="Monthly Revenue (Area)" xAxis="Month" height={300}>
      <ChartSeries name="Revenue" column="Revenue" color="#6366f1" />
    </Chart>
  </Sheet>
))

// ─── Stacked bar ──────────────────────────────────────────────────────────────

const stackedBarSheet = defineSheet('Stacked Bar', () => (
  <Sheet name="Stacked Bar">
    <Header title="Stacked Bar Chart" subtitle="Part-of-whole per category — see composition at a glance" />
    <Column name="Month"       type="string"  primary />
    <Column name="Engineering" type="number" />
    <Column name="Marketing"   type="number" />
    <Column name="Operations"  type="number" />
    <Section>
      {months.map((m, i) => (
        <Row key={m}>
          <Cell>{m}</Cell>
          <Cell>{[28, 31, 27, 33, 35, 38][i]}</Cell>
          <Cell>{[14, 16, 15, 18, 20, 22][i]}</Cell>
          <Cell>{[8,  9,  8,  10, 11, 12][i]}</Cell>
        </Row>
      ))}
    </Section>
    <Chart type="stacked-bar" title="Headcount by Department" xAxis="Month" height={320}>
      <ChartSeries name="Engineering" column="Engineering" color="#3b82f6" />
      <ChartSeries name="Marketing"   column="Marketing"   color="#f97316" />
      <ChartSeries name="Operations"  column="Operations"  color="#a855f7" />
    </Chart>
  </Sheet>
))

// ─── Stacked area ─────────────────────────────────────────────────────────────

const stackedAreaSheet = defineSheet('Stacked Area', () => (
  <Sheet name="Stacked Area">
    <Header title="Stacked Area Chart" subtitle="Share over time — see how channels grow together" />
    <Column name="Month"   type="string" primary />
    {channels.map((c) => <Column key={c} name={c} type="number" />)}
    <Section>
      {months.map((m, i) => (
        <Row key={m}>
          <Cell>{m}</Cell>
          {channels.map((_, ci) => <Cell key={ci}>{traffic[ci]?.[i] ?? 0}</Cell>)}
        </Row>
      ))}
    </Section>
    <Chart type="stacked-area" title="Traffic by Channel" xAxis="Month" height={320}>
      <ChartSeries name="Organic"  column="Organic"  color="#22c55e" />
      <ChartSeries name="Paid"     column="Paid"     color="#3b82f6" />
      <ChartSeries name="Referral" column="Referral" color="#f97316" />
      <ChartSeries name="Direct"   column="Direct"   color="#a855f7" />
    </Chart>
  </Sheet>
))

// ─── Pie ──────────────────────────────────────────────────────────────────────

const pieSheet = defineSheet('Pie', () => (
  <Sheet name="Pie">
    <Header title="Pie Chart" subtitle="Part-of-whole — best for 3–6 categories" />
    <Column name="Region"  type="string"   primary />
    <Column name="Revenue" type="currency" />
    <Section>
      <Row><Cell>North</Cell><Cell>520000</Cell></Row>
      <Row><Cell>South</Cell><Cell>310000</Cell></Row>
      <Row><Cell>East</Cell><Cell>480000</Cell></Row>
      <Row><Cell>West</Cell><Cell>390000</Cell></Row>
    </Section>
    <Chart type="pie" title="Revenue by Region" xAxis="Region" height={320} width={460}>
      <ChartSeries name="Revenue" column="Revenue" />
    </Chart>
  </Sheet>
))

// ─── Donut ────────────────────────────────────────────────────────────────────

const donutSheet = defineSheet('Donut', () => (
  <Sheet name="Donut">
    <Header title="Donut Chart" subtitle="Pie with hollow center — center space can show a KPI" />
    <Column name="Category" type="string"   primary />
    <Column name="Budget"   type="currency" />
    <Section>
      <Row><Cell>Engineering</Cell><Cell>480000</Cell></Row>
      <Row><Cell>Marketing</Cell><Cell>220000</Cell></Row>
      <Row><Cell>Sales</Cell><Cell>180000</Cell></Row>
      <Row><Cell>Operations</Cell><Cell>120000</Cell></Row>
    </Section>
    <Chart type="donut" title="Budget Allocation" xAxis="Category" height={320} width={460}>
      <ChartSeries name="Budget" column="Budget" />
    </Chart>
  </Sheet>
))

// ─── Scatter ──────────────────────────────────────────────────────────────────

const scatterSheet = defineSheet('Scatter', () => (
  <Sheet name="Scatter">
    <Header title="Scatter Chart" subtitle="Correlation between two variables — spot clusters and outliers" />
    <Chart type="scatter" title="Price vs Customer Rating" height={340}>
      <ChartSeries name="Products" color="#6366f1" points={[
        { x: 9,  y: 4.1 }, { x: 15, y: 3.8 }, { x: 22, y: 4.4 },
        { x: 29, y: 3.6 }, { x: 35, y: 4.7 }, { x: 42, y: 4.2 },
        { x: 55, y: 4.5 }, { x: 68, y: 3.9 }, { x: 79, y: 4.8 },
        { x: 95, y: 4.0 }, { x: 110, y: 4.6 }, { x: 130, y: 3.7 },
      ]} />
    </Chart>
  </Sheet>
))

// ─── Bubble ───────────────────────────────────────────────────────────────────

const bubbleSheet = defineSheet('Bubble', () => (
  <Sheet name="Bubble">
    <Header title="Bubble Chart" subtitle="Three variables: x position, y position, and bubble size (r)" />
    <Chart type="bubble" title="Revenue / Margin / Volume" height={340}>
      <ChartSeries name="Products" color="#3b82f6" points={[
        { x: 20, y: 28, r: 8  },
        { x: 35, y: 52, r: 14 },
        { x: 50, y: 38, r: 6  },
        { x: 65, y: 61, r: 18 },
        { x: 80, y: 44, r: 10 },
        { x: 95, y: 70, r: 20 },
      ]} />
      <ChartSeries name="Services" color="#22c55e" points={[
        { x: 15, y: 45, r: 12 },
        { x: 40, y: 30, r: 7  },
        { x: 60, y: 55, r: 15 },
        { x: 75, y: 35, r: 9  },
      ]} />
    </Chart>
  </Sheet>
))

// ─── Radar ────────────────────────────────────────────────────────────────────

const radarSheet = defineSheet('Radar', () => (
  <Sheet name="Radar">
    <Header title="Radar Chart" subtitle="Multi-axis comparison — great for capability or performance profiles" />
    <Chart type="radar" title="Team Skills Assessment" height={380}>
      <ChartSeries name="Alice" color="#3b82f6"
        data={[88, 92, 75, 95, 82, 78]} />
      <ChartSeries name="Bob"   color="#ef4444"
        data={[72, 85, 91, 68, 88, 94]} />
      <ChartSeries name="Carol" color="#22c55e"
        data={[95, 78, 83, 87, 70, 85]} />
    </Chart>
  </Sheet>
))

// ─── Export as multi-sheet workbook ───────────────────────────────────────────

export default workbook('Chart Showcase', [
  barSheet,
  hBarSheet,
  lineSheet,
  areaSheet,
  stackedBarSheet,
  stackedAreaSheet,
  pieSheet,
  donutSheet,
  scatterSheet,
  bubbleSheet,
  radarSheet,
])
