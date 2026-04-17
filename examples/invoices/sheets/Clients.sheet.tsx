import { defineSheet, Sheet, Column, Formula, Header, Row, Cell, Section, Chart, ChartSeries } from 'nextsheet'

export default defineSheet('Clients', () => (
  <Sheet>
    <Header
      title="Clients"
      subtitle="Customer database — Acme Corp"
    />

    <Column name="id"       type="number"  primary />
    <Column name="name"     type="string"  required />
    <Column name="industry" type="string"  />
    <Column name="country"  type="string"  />
    <Column name="contact"  type="string"  />
    <Column name="email"    type="string"  />
    <Column name="since"    type="date"    />
    <Column name="plan"     type="string"  />
    <Column name="mrr"      type="currency" currency="USD" />
    <Column name="active"   type="boolean" default={true} />
    <Column
      name="arr"
      type="currency"
      currency="USD"
      formula={({ mrr }) => <Formula>{mrr} * 12</Formula>}
    />

    <Section title="Technology">
      <Row><Cell>1</Cell><Cell>Stripe Inc.</Cell><Cell>FinTech</Cell><Cell>USA</Cell><Cell>Patrick Collison</Cell><Cell>patrick@stripe.com</Cell><Cell>2022-03-15</Cell><Cell>Enterprise</Cell><Cell>3600</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>2</Cell><Cell>Vercel</Cell><Cell>Infrastructure</Cell><Cell>USA</Cell><Cell>Guillermo Rauch</Cell><Cell>guillermo@vercel.com</Cell><Cell>2022-07-01</Cell><Cell>Enterprise</Cell><Cell>2200</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>3</Cell><Cell>Linear</Cell><Cell>Productivity</Cell><Cell>USA</Cell><Cell>Karri Saarinen</Cell><Cell>karri@linear.app</Cell><Cell>2023-01-10</Cell><Cell>Pro</Cell><Cell>1000</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>4</Cell><Cell>Figma</Cell><Cell>Design</Cell><Cell>USA</Cell><Cell>Dylan Field</Cell><Cell>dylan@figma.com</Cell><Cell>2022-11-20</Cell><Cell>Pro</Cell><Cell>1750</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>5</Cell><Cell>Notion</Cell><Cell>Productivity</Cell><Cell>USA</Cell><Cell>Ivan Zhao</Cell><Cell>ivan@notion.so</Cell><Cell>2023-04-05</Cell><Cell>Starter</Cell><Cell>600</Cell><Cell>true</Cell><Cell /></Row>
    </Section>

    <Section title="Europe">
      <Row><Cell>6</Cell><Cell>Spotify</Cell><Cell>Media</Cell><Cell>Sweden</Cell><Cell>Daniel Ek</Cell><Cell>daniel@spotify.com</Cell><Cell>2023-06-18</Cell><Cell>Enterprise</Cell><Cell>4100</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>7</Cell><Cell>Shopify</Cell><Cell>E-commerce</Cell><Cell>Canada</Cell><Cell>Tobi Lütke</Cell><Cell>tobi@shopify.com</Cell><Cell>2022-09-12</Cell><Cell>Enterprise</Cell><Cell>3800</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>8</Cell><Cell>Intercom</Cell><Cell>CRM</Cell><Cell>Ireland</Cell><Cell>Des Traynor</Cell><Cell>des@intercom.com</Cell><Cell>2023-02-28</Cell><Cell>Pro</Cell><Cell>1400</Cell><Cell>false</Cell><Cell /></Row>
      <Row><Cell>9</Cell><Cell>Revolut</Cell><Cell>FinTech</Cell><Cell>UK</Cell><Cell>Nikolay Storonsky</Cell><Cell>nikolay@revolut.com</Cell><Cell>2024-01-07</Cell><Cell>Starter</Cell><Cell>500</Cell><Cell>true</Cell><Cell /></Row>
      <Row><Cell>10</Cell><Cell>Personio</Cell><Cell>HR Tech</Cell><Cell>Germany</Cell><Cell>Hanno Renner</Cell><Cell>hanno@personio.de</Cell><Cell>2024-03-22</Cell><Cell>Starter</Cell><Cell>400</Cell><Cell>false</Cell><Cell /></Row>
    </Section>

    {/* MRR por plan — bar chart */}
    <Chart
      type="bar"
      title="MRR by Plan (USD)"
      xAxis="plan"
      showLegend={false}
      width={700}
      height={300}
    >
      <ChartSeries
        name="MRR"
        data={[3600, 2200, 1000, 1750, 600, 4100, 3800, 1400, 500, 400]}
        color="#6366f1"
      />
    </Chart>

    {/* Distribución por industria — donut chart */}
    <Chart
      type="donut"
      title="Clients by Industry"
      showLegend={true}
      width={500}
      height={320}
    >
      <ChartSeries name="FinTech"        data={[2]} color="#6366f1" />
      <ChartSeries name="Productivity"   data={[2]} color="#06b6d4" />
      <ChartSeries name="Infrastructure" data={[1]} color="#f59e0b" />
      <ChartSeries name="Design"         data={[1]} color="#10b981" />
      <ChartSeries name="E-commerce"     data={[1]} color="#ec4899" />
      <ChartSeries name="Media"          data={[1]} color="#f97316" />
      <ChartSeries name="CRM"            data={[1]} color="#8b5cf6" />
      <ChartSeries name="HR Tech"        data={[1]} color="#14b8a6" />
    </Chart>

    {/* ARR acumulado por cliente — line chart */}
    <Chart
      type="line"
      title="ARR per Client (USD)"
      xAxis="name"
      showLegend={false}
      width={900}
      height={280}
    >
      <ChartSeries
        name="ARR"
        data={[43200, 26400, 12000, 21000, 7200, 49200, 45600, 16800, 6000, 4800]}
        color="#10b981"
      />
    </Chart>
  </Sheet>
))
