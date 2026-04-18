import {
  defineSheet, Sheet, Header,
  Column, Formula, Section, Row, Cell,
  Chart, ChartSeries,
  useQuery,
} from 'nextsheet'

// ─── Live crypto prices from CoinGecko (free — no API key required) ───────────
// Falls back to snapshot values if the request fails or times out.

interface CoinGeckoPrice {
  usd:            number
  usd_24h_change: number
}

const FALLBACK: Record<string, CoinGeckoPrice> = {
  bitcoin:  { usd: 67_420, usd_24h_change:  2.34 },
  ethereum: { usd:  3_280, usd_24h_change:  1.82 },
  solana:   { usd:    188, usd_24h_change: -0.91 },
}

let livePrice: Record<string, CoinGeckoPrice> = FALLBACK
let priceSource = 'snapshot'

try {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
    { signal: AbortSignal.timeout(8_000) }
  )
  if (res.ok) {
    livePrice = await res.json() as Record<string, CoinGeckoPrice>
    priceSource = 'CoinGecko live'
  }
} catch {
  // network unavailable — fallback prices are used
}

const btcPrice = livePrice['bitcoin']?.usd  ?? FALLBACK['bitcoin']!.usd
const ethPrice = livePrice['ethereum']?.usd ?? FALLBACK['ethereum']!.usd
const solPrice = livePrice['solana']?.usd   ?? FALLBACK['solana']!.usd
const btcChange = livePrice['bitcoin']?.usd_24h_change  ?? 0
const ethChange = livePrice['ethereum']?.usd_24h_change ?? 0
const solChange = livePrice['solana']?.usd_24h_change   ?? 0

// ─── Portfolio holdings ───────────────────────────────────────────────────────

interface Holding {
  asset:       string
  type:        string
  units:       number
  avgCost:     number
  currentPrice: number
  value:       number
  costBasis:   number
  pnl:         number
  pnlPct:      number
  change24h:   number
}

function holding(
  asset: string, type: string, units: number, avgCost: number, currentPrice: number, change24h = 0
): Holding {
  const value    = units * currentPrice
  const costBasis = units * avgCost
  const pnl      = value - costBasis
  const pnlPct   = (pnl / costBasis) * 100
  return { asset, type, units, avgCost, currentPrice, value, costBasis, pnl, pnlPct, change24h }
}

const portfolio: Holding[] = [
  // Crypto — live prices
  holding('Bitcoin',  'Crypto', 0.52,  38_000, btcPrice, btcChange),
  holding('Ethereum', 'Crypto', 4.20,   2_100, ethPrice, ethChange),
  holding('Solana',   'Crypto', 85,        95, solPrice, solChange),

  // Stocks & ETFs — static prices (extend with a stock API if needed)
  holding('Apple (AAPL)',    'Stock', 25, 165, 212.40),
  holding('Microsoft (MSFT)', 'Stock', 15, 310, 421.80),
  holding('Nvidia (NVDA)',    'Stock',  8, 480, 875.20),
  holding('Vanguard S&P 500 (VOO)', 'ETF', 20, 400, 498.30),
  holding('iShares MSCI World (URTH)', 'ETF', 30, 110, 139.80),

  // Bonds
  holding('US Treasury 10Y (TLT)', 'Bond', 40, 88, 94.20),
]

const totalValue    = portfolio.reduce((s, h) => s + h.value, 0)
const totalCost     = portfolio.reduce((s, h) => s + h.costBasis, 0)
const totalPnL      = totalValue - totalCost
const totalPnLPct   = (totalPnL / totalCost) * 100

export default defineSheet('Investments', () => {
  const gainers = useQuery(portfolio).where('pnl', '>', 0).orderBy('pnlPct', 'desc').toArray()
  const losers  = useQuery(portfolio).where('pnl', '<', 0).orderBy('pnlPct', 'asc').toArray()

  return (
    <Sheet>
      <Header
        title="Investment Portfolio — 2026"
        subtitle={`Prices from ${priceSource} · Total value $${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} · P&L $${totalPnL.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${totalPnLPct.toFixed(1)}%)`}
      />

      <Column name="asset"        type="string"   primary />
      <Column name="type"         type="string" />
      <Column name="units"        type="number"   format="#,##0.####" />
      <Column name="avgCost"      type="currency" currency="USD" />
      <Column name="currentPrice" type="currency" currency="USD" />
      <Column name="value"        type="currency" currency="USD" />
      <Column name="costBasis"    type="currency" currency="USD" />
      <Column name="pnl"          type="currency" currency="USD" />
      <Column name="pnlPct"       type="number"   format="#,##0.00" />
      <Column name="change24h"    type="number"   format="#,##0.00" />

      {/* ── Portfolio summary ─────────────────────────────────────────── */}
      <Section title="Portfolio Summary">
        <Row><Cell bold>Total Value</Cell>    <Cell>{totalValue}</Cell>  <Cell /></Row>
        <Row><Cell bold>Total Cost Basis</Cell><Cell>{totalCost}</Cell>  <Cell /></Row>
        <Row>
          <Cell bold>Total P&amp;L</Cell>
          <Cell bold color={totalPnL >= 0 ? 'green' : 'red'}>{totalPnL}</Cell>
          <Cell color={totalPnL >= 0 ? 'green' : 'red'}>{totalPnLPct.toFixed(2)}%</Cell>
        </Row>
      </Section>

      {/* ── All holdings ──────────────────────────────────────────────── */}
      <Section title="All Holdings">
        <Row header>
          <Cell>Asset</Cell><Cell>Type</Cell><Cell>Units</Cell>
          <Cell>Avg Cost</Cell><Cell>Current Price</Cell><Cell>Value</Cell>
          <Cell>Cost Basis</Cell><Cell>P&amp;L</Cell><Cell>P&amp;L %</Cell><Cell>24h %</Cell>
        </Row>
        {portfolio.map(h => (
          <Row key={h.asset}>
            <Cell bold>{h.asset}</Cell>
            <Cell>{h.type}</Cell>
            <Cell>{h.units}</Cell>
            <Cell>{h.avgCost}</Cell>
            <Cell>{h.currentPrice}</Cell>
            <Cell bold>{h.value}</Cell>
            <Cell>{h.costBasis}</Cell>
            <Cell color={h.pnl >= 0 ? 'green' : 'red'}>{h.pnl}</Cell>
            <Cell color={h.pnlPct >= 0 ? 'green' : 'red'}>{h.pnlPct}</Cell>
            <Cell color={h.change24h >= 0 ? 'green' : 'red'}>{h.change24h}</Cell>
          </Row>
        ))}
      </Section>

      {/* ── Top gainers ───────────────────────────────────────────────── */}
      {gainers.length > 0 && (
        <Section title="Top Gainers">
          {gainers.map(h => (
            <Row key={`g-${h.asset}`}>
              <Cell bold color="green">{h.asset}</Cell>
              <Cell>{h.type}</Cell>
              <Cell>{h.units}</Cell>
              <Cell>{h.avgCost}</Cell>
              <Cell>{h.currentPrice}</Cell>
              <Cell bold>{h.value}</Cell>
              <Cell>{h.costBasis}</Cell>
              <Cell bold color="green">{h.pnl}</Cell>
              <Cell bold color="green">{h.pnlPct}</Cell>
              <Cell color="green">{h.change24h}</Cell>
            </Row>
          ))}
        </Section>
      )}

      {/* ── Losers ────────────────────────────────────────────────────── */}
      {losers.length > 0 && (
        <Section title="Underperforming">
          {losers.map(h => (
            <Row key={`l-${h.asset}`}>
              <Cell bold color="red">{h.asset}</Cell>
              <Cell>{h.type}</Cell>
              <Cell>{h.units}</Cell>
              <Cell>{h.avgCost}</Cell>
              <Cell>{h.currentPrice}</Cell>
              <Cell>{h.value}</Cell>
              <Cell>{h.costBasis}</Cell>
              <Cell bold color="red">{h.pnl}</Cell>
              <Cell bold color="red">{h.pnlPct}</Cell>
              <Cell color={h.change24h >= 0 ? 'green' : 'red'}>{h.change24h}</Cell>
            </Row>
          ))}
        </Section>
      )}

      {/* Portfolio allocation */}
      <Chart type="donut" title="Portfolio Allocation by Value" showLegend height={360}>
        {portfolio.map(h => (
          <ChartSeries key={h.asset} name={h.asset} data={[h.value]} />
        ))}
      </Chart>

      {/* P&L by asset */}
      <Chart type="bar" title="Unrealized P&L by Asset (USD)" showLegend={false} width={960} height={300}>
        <ChartSeries
          name="P&L"
          data={portfolio.map(h => h.pnl)}
          color="#0f766e"
        />
      </Chart>

      {/* Value vs Cost comparison */}
      <Chart type="bar" title="Current Value vs Cost Basis" showLegend width={960} height={320}>
        <ChartSeries name="Cost Basis"     data={portfolio.map(h => h.costBasis)}    color="#94a3b8" />
        <ChartSeries name="Current Value"  data={portfolio.map(h => h.value)}        color="#0f766e" />
      </Chart>
    </Sheet>
  )
})
