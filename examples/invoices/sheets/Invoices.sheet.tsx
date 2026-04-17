import { defineSheet, Sheet, Column, Formula, Header, Row, Cell, Section, Chart, ChartSeries } from 'nextsheet'

export default defineSheet('Invoices 2026', () => (
  <Sheet>
    <Header
      title="Invoices 2026"
      subtitle="Monthly billing summary — Acme Corp"
    />

    <Column name="id"     type="number"   primary />
    <Column name="client" type="string"   required />
    <Column name="month"  type="string"   required />
    <Column name="amount" type="currency" currency="USD" />
    <Column name="paid"   type="boolean"  default={false} />
    <Column
      name="total"
      type="currency"
      currency="USD"
      formula={({ amount }) => <Formula>{amount} * 1.21</Formula>}
    />

    <Section title="Q1">
      <Row><Cell>1</Cell><Cell>Stripe Inc.</Cell><Cell>January</Cell><Cell>12500</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>2</Cell><Cell>Vercel</Cell><Cell>January</Cell><Cell>8400</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>3</Cell><Cell>Linear</Cell><Cell>February</Cell><Cell>5200</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>4</Cell><Cell>Figma</Cell><Cell>February</Cell><Cell>9750</Cell><Cell>false</Cell><Cell /></Row>
      <Row><Cell>5</Cell><Cell>Notion</Cell><Cell>March</Cell><Cell>3100</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>6</Cell><Cell>Stripe Inc.</Cell><Cell>March</Cell><Cell>14200</Cell><Cell>false</Cell><Cell /></Row>
    </Section>

    <Section title="Q2">
      <Row><Cell>7</Cell><Cell>Vercel</Cell><Cell>April</Cell><Cell>9600</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>8</Cell><Cell>Linear</Cell><Cell>April</Cell><Cell>6800</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>9</Cell><Cell>Figma</Cell><Cell>May</Cell><Cell>11300</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>10</Cell><Cell>Notion</Cell><Cell>May</Cell><Cell>4200</Cell><Cell>false</Cell><Cell /></Row>
      <Row><Cell>11</Cell><Cell>Stripe Inc.</Cell><Cell>June</Cell><Cell>16500</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>12</Cell><Cell>Vercel</Cell><Cell>June</Cell><Cell>7900</Cell><Cell>false</Cell><Cell /></Row>
    </Section>

    {/* Revenue by month — bar chart */}
    <Chart
      type="bar"
      title="Revenue by Month (USD)"
      xAxis="month"
      showLegend={true}
      width={900}
      height={320}
    >
      <ChartSeries
        name="Stripe Inc."
        data={[12500, 0, 14200, 0, 0, 16500]}
        color="#6366f1"
      />
      <ChartSeries
        name="Vercel"
        data={[8400, 0, 0, 9600, 0, 7900]}
        color="#06b6d4"
      />
      <ChartSeries
        name="Figma"
        data={[0, 9750, 0, 0, 11300, 0]}
        color="#f59e0b"
      />
      <ChartSeries
        name="Linear"
        data={[0, 5200, 0, 6800, 0, 0]}
        color="#10b981"
      />
      <ChartSeries
        name="Notion"
        data={[0, 3100, 0, 0, 4200, 0]}
        color="#ec4899"
      />
    </Chart>

    {/* Total billed per client — donut chart */}
    <Chart
      type="donut"
      title="Total Billed per Client"
      showLegend={true}
      width={500}
      height={320}
    >
      <ChartSeries name="Stripe Inc." data={[43200]} color="#6366f1" />
      <ChartSeries name="Vercel"      data={[25900]} color="#06b6d4" />
      <ChartSeries name="Figma"       data={[21050]} color="#f59e0b" />
      <ChartSeries name="Linear"      data={[12000]} color="#10b981" />
      <ChartSeries name="Notion"      data={[7300]}  color="#ec4899" />
    </Chart>

    {/* Monthly revenue trend — line chart */}
    <Chart
      type="line"
      title="Monthly Revenue Trend"
      xAxis="month"
      showLegend={false}
      width={900}
      height={280}
    >
      <ChartSeries
        name="Total Revenue"
        data={[20900, 18050, 17300, 16400, 15500, 24400]}
        color="#6366f1"
      />
    </Chart>
  </Sheet>
))
