import {
  defineSheet, Sheet, Header,
  Column, Section, Row, Cell,
  Paginate, Chart, ChartSeries,
  useQuery,
} from 'nextsheet'

// ─── Shared option lists (also used in Dashboard for cross-sheet filtering) ───

export const NATURALEZA_OPTIONS    = ['Personal', 'Empresa']
export const CLASIFICACION_OPTIONS = ['Gasto', 'Ingreso', 'Ahorro', 'Gasto*']
export const TIPO_OPTIONS          = ['Fijo', 'Variable']
export const CATEGORIA_OPTIONS     = [
  'Alquiler', 'Comidas afuera', 'Supermercado', 'Transporte',
  'Servicios Hosting', 'Servicios Aplicaciones', 'Suscripciones',
  'Salud', 'Educación', 'Entretenimiento', 'Ahorro personal',
  'Sueldo', 'Inversiones', 'Préstamos', 'Mantenimiento', 'Otros gastos',
]

// ─── Transactions ─────────────────────────────────────────────────────────────

interface Tx {
  mes:           string
  año:           number
  tipo:          string
  fecha:         string
  naturaleza:    string
  clasificacion: string
  categoria:     string
  descripcion:   string
  monto:         number
}

const t = (
  mes: string, tipo: string, fecha: string,
  naturaleza: string, clasificacion: string,
  categoria: string, descripcion: string, monto: number
): Tx => ({ mes, año: 2026, tipo, fecha, naturaleza, clasificacion, categoria, descripcion, monto })

const transactions: Tx[] = [
  // ── Enero ─────────────────────────────────────────────────────────────────
  t('enero', 'Fijo',     '5/1/2026',  'Empresa',  'Gasto*',   'Servicios Aplicaciones', 'Meta Fuego.space',             35.789),
  t('enero', 'Fijo',     '5/1/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Framer Websites',             70.624),
  t('enero', 'Fijo',     '5/1/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Bubble Personal Barbara',     49.766),
  t('enero', 'Fijo',     '5/1/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Bubble Claro Barbara',        49.766),
  t('enero', 'Fijo',     '5/1/2026',  'Empresa',  'Gasto*',   'Suscripciones',          'Apple Storage',                6.068),
  t('enero', 'Fijo',     '5/1/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Bubble Fuego',                49.280),
  t('enero', 'Variable', '5/1/2026',  'Personal', 'Gasto',    'Otros gastos',           'Sancor Salud - Ultima cuota', 423.496),
  t('enero', 'Variable', '5/1/2026',  'Personal', 'Ingreso',  'Sueldo',                 'Fuego Sueldo',              700.000),
  t('enero', 'Variable', '5/1/2026',  'Personal', 'Ahorro',   'Ahorro personal',        'Exness',                    154.000),
  t('enero', 'Variable', '5/1/2026',  'Personal', 'Gasto',    'Otros gastos',           'Prestamo MP',               173.451),
  t('enero', 'Variable', '5/1/2026',  'Personal', 'Ingreso',  'Sueldo',                 'Securbase honorarios',     1700.000),
  t('enero', 'Variable', '5/1/2026',  'Personal', 'Ahorro',   'Ahorro personal',        'Ahorro mercadopago',        500.000),
  t('enero', 'Fijo',     '5/1/2026',  'Empresa',  'Gasto*',   'Servicios Aplicaciones', 'Figma',                      92.400),
  t('enero', 'Fijo',     '5/1/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Sendgrid Mails',             53.130),
  t('enero', 'Fijo',     '5/1/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'AWS',                        12.320),
  t('enero', 'Fijo',     '6/1/2026',  'Personal', 'Gasto',    'Alquiler',               'Casa',                      684.909),
  t('enero', 'Variable', '6/1/2026',  'Personal', 'Gasto',    'Comidas afuera',         'Cafe',                       22.000),
  t('enero', 'Fijo',     '6/1/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Hostinger',                  41.000),
  t('enero', 'Fijo',     '7/1/2026',  'Empresa',  'Gasto*',   'Servicios Aplicaciones', 'Capcut',                     21.560),
  t('enero', 'Variable', '7/1/2026',  'Personal', 'Gasto',    'Comidas afuera',         'Bruno',                      34.000),
  t('enero', 'Fijo',     '8/1/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Control Avicola',            49.766),
  t('enero', 'Fijo',     '8/1/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Bubble Fuego',               49.766),
  t('enero', 'Fijo',     '8/1/2026',  'Personal', 'Gasto',    'Servicios Hosting',      'Gas - Camuzzi',              25.946),
  t('enero', 'Variable', '8/1/2026',  'Personal', 'Gasto',    'Educación',              'Edea',                       37.800),
  t('enero', 'Variable', '8/1/2026',  'Personal', 'Gasto',    'Mantenimiento',          'Flor',                       40.000),
  t('enero', 'Fijo',     '9/1/2026',  'Empresa',  'Gasto*',   'Servicios Aplicaciones', 'Vercel',                     20.000),
  t('enero', 'Variable', '10/1/2026', 'Personal', 'Gasto',    'Comidas afuera',         'Mercado local',              15.000),
  t('enero', 'Fijo',     '10/1/2026', 'Empresa',  'Gasto*',   'Servicios Aplicaciones', 'Anthropic API',             150.000),
  t('enero', 'Variable', '15/1/2026', 'Personal', 'Ingreso',  'Sueldo',                 'Freelance cliente A',       320.000),
  t('enero', 'Variable', '20/1/2026', 'Personal', 'Gasto',    'Salud',                  'Farmacia',                   28.500),
  t('enero', 'Variable', '22/1/2026', 'Empresa',  'Gasto*',   'Suscripciones',          'GitHub Copilot',             19.000),
  t('enero', 'Variable', '25/1/2026', 'Personal', 'Gasto',    'Entretenimiento',        'Spotify',                     9.990),
  t('enero', 'Fijo',     '28/1/2026', 'Personal', 'Gasto',    'Suscripciones',          'Netflix',                    15.490),

  // ── Febrero ───────────────────────────────────────────────────────────────
  t('febrero', 'Fijo',     '5/2/2026',  'Empresa',  'Gasto*',   'Servicios Aplicaciones', 'Meta Fuego.space',           35.789),
  t('febrero', 'Fijo',     '5/2/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Framer Websites',            70.624),
  t('febrero', 'Fijo',     '5/2/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Bubble Personal Barbara',    49.766),
  t('febrero', 'Fijo',     '5/2/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'AWS',                        14.200),
  t('febrero', 'Fijo',     '5/2/2026',  'Empresa',  'Gasto*',   'Suscripciones',          'Apple Storage',               6.068),
  t('febrero', 'Fijo',     '5/2/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Bubble Fuego',               49.280),
  t('febrero', 'Fijo',     '6/2/2026',  'Personal', 'Gasto',    'Alquiler',               'Casa',                      684.909),
  t('febrero', 'Variable', '6/2/2026',  'Personal', 'Gasto',    'Comidas afuera',         'Cafe',                       18.000),
  t('febrero', 'Fijo',     '6/2/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Hostinger',                  41.000),
  t('febrero', 'Variable', '8/2/2026',  'Personal', 'Gasto',    'Salud',                  'Sancor Salud',              423.496),
  t('febrero', 'Variable', '8/2/2026',  'Personal', 'Ingreso',  'Sueldo',                 'Fuego Sueldo',              700.000),
  t('febrero', 'Variable', '8/2/2026',  'Personal', 'Ahorro',   'Ahorro personal',        'Exness',                    200.000),
  t('febrero', 'Variable', '10/2/2026', 'Personal', 'Ingreso',  'Sueldo',                 'Securbase honorarios',     1700.000),
  t('febrero', 'Fijo',     '10/2/2026', 'Empresa',  'Gasto*',   'Servicios Aplicaciones', 'Figma',                      92.400),
  t('febrero', 'Fijo',     '10/2/2026', 'Empresa',  'Gasto*',   'Servicios Aplicaciones', 'Anthropic API',             120.000),
  t('febrero', 'Variable', '14/2/2026', 'Personal', 'Gasto',    'Comidas afuera',         'Cena San Valentín',         145.000),
  t('febrero', 'Variable', '18/2/2026', 'Personal', 'Gasto',    'Educación',              'Curso online',               49.000),
  t('febrero', 'Variable', '20/2/2026', 'Personal', 'Ahorro',   'Inversiones',            'Compra BTC',                300.000),
  t('febrero', 'Variable', '22/2/2026', 'Personal', 'Gasto',    'Entretenimiento',        'Cine + salida',              55.000),
  t('febrero', 'Fijo',     '25/2/2026', 'Empresa',  'Gasto*',   'Suscripciones',          'GitHub Copilot',             19.000),

  // ── Marzo ─────────────────────────────────────────────────────────────────
  t('marzo', 'Fijo',     '5/3/2026',  'Empresa',  'Gasto*',   'Servicios Aplicaciones', 'Meta Fuego.space',            35.789),
  t('marzo', 'Fijo',     '5/3/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Framer Websites',             70.624),
  t('marzo', 'Fijo',     '5/3/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Bubble Personal Barbara',     49.766),
  t('marzo', 'Fijo',     '5/3/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'AWS',                         18.500),
  t('marzo', 'Fijo',     '5/3/2026',  'Empresa',  'Gasto*',   'Suscripciones',          'Apple Storage',                6.068),
  t('marzo', 'Fijo',     '6/3/2026',  'Personal', 'Gasto',    'Alquiler',               'Casa',                       684.909),
  t('marzo', 'Variable', '6/3/2026',  'Personal', 'Gasto',    'Comidas afuera',         'Almuerzo',                    25.000),
  t('marzo', 'Fijo',     '6/3/2026',  'Empresa',  'Gasto*',   'Servicios Hosting',      'Hostinger',                   41.000),
  t('marzo', 'Variable', '8/3/2026',  'Personal', 'Gasto',    'Salud',                  'Sancor Salud',               423.496),
  t('marzo', 'Variable', '8/3/2026',  'Personal', 'Ingreso',  'Sueldo',                 'Fuego Sueldo',               700.000),
  t('marzo', 'Variable', '10/3/2026', 'Personal', 'Ingreso',  'Sueldo',                 'Securbase honorarios',      1700.000),
  t('marzo', 'Fijo',     '10/3/2026', 'Empresa',  'Gasto*',   'Servicios Aplicaciones', 'Figma',                       92.400),
  t('marzo', 'Variable', '12/3/2026', 'Personal', 'Gasto',    'Mantenimiento',          'Plomero',                     80.000),
  t('marzo', 'Variable', '15/3/2026', 'Personal', 'Ahorro',   'Ahorro personal',        'Ahorro mes',                 500.000),
  t('marzo', 'Variable', '18/3/2026', 'Personal', 'Gasto',    'Educación',              'Libro técnico',               22.000),
  t('marzo', 'Variable', '20/3/2026', 'Empresa',  'Gasto*',   'Servicios Aplicaciones', 'Anthropic API',              180.000),
  t('marzo', 'Variable', '25/3/2026', 'Personal', 'Gasto',    'Entretenimiento',        'Evento cultural',             35.000),
  t('marzo', 'Fijo',     '25/3/2026', 'Empresa',  'Gasto*',   'Suscripciones',          'GitHub Copilot',              19.000),
  t('marzo', 'Variable', '28/3/2026', 'Personal', 'Ingreso',  'Sueldo',                 'Freelance cliente B',        450.000),
]

// ─── Aggregates for charts ────────────────────────────────────────────────────

const gastos     = transactions.filter(tx => tx.clasificacion.startsWith('Gasto'))
const ingresos   = transactions.filter(tx => tx.clasificacion === 'Ingreso')
const ahorros    = transactions.filter(tx => tx.clasificacion === 'Ahorro')
const empresaTx  = transactions.filter(tx => tx.naturaleza === 'Empresa')
const personalTx = transactions.filter(tx => tx.naturaleza === 'Personal')

const totalGastos   = gastos.reduce((s, tx) => s + tx.monto, 0)
const totalIngresos = ingresos.reduce((s, tx) => s + tx.monto, 0)
const totalAhorros  = ahorros.reduce((s, tx) => s + tx.monto, 0)

// Monthly totals for chart
const meses = ['enero', 'febrero', 'marzo']
const monthlyGastos   = meses.map(m => gastos.filter(tx => tx.mes === m).reduce((s, tx) => s + tx.monto, 0))
const monthlyIngresos = meses.map(m => ingresos.filter(tx => tx.mes === m).reduce((s, tx) => s + tx.monto, 0))

// By category
const byCat: Record<string, number> = {}
for (const tx of gastos) byCat[tx.categoria] = (byCat[tx.categoria] ?? 0) + tx.monto
const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 8)

// Group transactions by month for sections
const byMes: Record<string, Tx[]> = {}
for (const tx of transactions) (byMes[tx.mes] ??= []).push(tx)

export default defineSheet('Gastos', () => {
  const biggestExpenses = useQuery(gastos).orderBy('monto', 'desc').limit(5).toArray()

  return (
    <Sheet>
      <Header
        title="Registro de Gastos — 2026"
        subtitle={`${transactions.length} transacciones · Gastos $${totalGastos.toFixed(2)} · Ingresos $${totalIngresos.toFixed(2)} · Ahorro $${totalAhorros.toFixed(2)}`}
      />

      {/* Filter dropdowns — selecting a value filters ALL sheets */}
      <Paginate pageSize={20} />

      <Column name="mes"           type="string" primary />
      <Column name="año"           type="number" />
      <Column name="tipo"          type="string" options={TIPO_OPTIONS} />
      <Column name="fecha"         type="string" />
      <Column name="naturaleza"    type="string" options={NATURALEZA_OPTIONS} />
      <Column name="clasificacion" type="string" options={CLASIFICACION_OPTIONS} />
      <Column name="categoria"     type="string" options={CATEGORIA_OPTIONS} />
      <Column name="descripcion"   type="string" />
      <Column name="monto"         type="currency" currency="USD" />

      {Object.entries(byMes).map(([mes, txs]) => {
        const total = txs.reduce((s, tx) => s + tx.monto, 0)
        return (
          <Section key={mes} title={`${mes.charAt(0).toUpperCase() + mes.slice(1)} 2026 — $${total.toFixed(2)}`}>
            {txs.map((tx, i) => (
              <Row key={`${mes}-${i}`}>
                <Cell>{tx.mes}</Cell>
                <Cell>{tx.año}</Cell>
                <Cell>{tx.tipo}</Cell>
                <Cell>{tx.fecha}</Cell>
                <Cell color={tx.naturaleza === 'Empresa' ? 'blue' : 'purple'}>{tx.naturaleza}</Cell>
                <Cell color={tx.clasificacion === 'Ingreso' ? 'green' : tx.clasificacion === 'Ahorro' ? 'blue' : 'red'}>
                  {tx.clasificacion}
                </Cell>
                <Cell>{tx.categoria}</Cell>
                <Cell>{tx.descripcion}</Cell>
                <Cell>{tx.monto}</Cell>
              </Row>
            ))}
          </Section>
        )
      })}

      {/* Top 5 gastos más grandes */}
      <Section title="Top 5 Gastos Mayores">
        <Row header>
          <Cell>Mes</Cell><Cell>Año</Cell><Cell>Tipo</Cell><Cell>Fecha</Cell>
          <Cell>Naturaleza</Cell><Cell>Clasificación</Cell><Cell>Categoría</Cell>
          <Cell>Descripción</Cell><Cell>Monto</Cell>
        </Row>
        {biggestExpenses.map((tx, i) => (
          <Row key={`top-${i}`}>
            <Cell>{tx.mes}</Cell>
            <Cell>{tx.año}</Cell>
            <Cell>{tx.tipo}</Cell>
            <Cell>{tx.fecha}</Cell>
            <Cell color="blue">{tx.naturaleza}</Cell>
            <Cell color="red">{tx.clasificacion}</Cell>
            <Cell>{tx.categoria}</Cell>
            <Cell bold>{tx.descripcion}</Cell>
            <Cell bold color="red">{tx.monto}</Cell>
          </Row>
        ))}
      </Section>

      {/* Gastos vs ingresos por mes */}
      <Chart type="bar" title="Gastos vs Ingresos por Mes" xAxis="mes" showLegend width={900} height={300}>
        <ChartSeries name="Ingresos" data={monthlyIngresos} color="#0f766e" />
        <ChartSeries name="Gastos"   data={monthlyGastos}   color="#e11d48" />
      </Chart>

      {/* Distribución de gastos por categoría */}
      <Chart type="donut" title="Gastos por Categoría" showLegend height={360}>
        {topCats.map(([cat, amount]) => (
          <ChartSeries key={cat} name={cat} data={[amount]} />
        ))}
      </Chart>

      {/* Empresa vs Personal */}
      <Chart type="pie" title="Empresa vs Personal" showLegend height={300}>
        <ChartSeries name="Empresa"  data={[empresaTx.reduce((s, tx) => s + tx.monto, 0)]}  color="#0369a1" />
        <ChartSeries name="Personal" data={[personalTx.reduce((s, tx) => s + tx.monto, 0)]} color="#7c3aed" />
      </Chart>
    </Sheet>
  )
})
