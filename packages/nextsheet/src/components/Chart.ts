import type { ChartNode, ChartProps, ChartSeriesNode } from '../types.js'

function isChartSeriesNode(v: unknown): v is ChartSeriesNode {
  return typeof v === 'object' && v !== null && (v as ChartSeriesNode).kind === 'chart-series'
}

export function Chart({ type, title, xAxis, showLegend, width, height, children }: ChartProps): ChartNode {
  const raw = Array.isArray(children) ? children : children !== undefined ? [children] : []
  const series = raw.flat().filter(isChartSeriesNode)
  return { kind: 'chart', type, title, xAxis, showLegend, series, width, height }
}
