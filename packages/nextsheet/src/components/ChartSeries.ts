import type { ChartSeriesNode, ChartSeriesProps } from '../types/index.js'

export function ChartSeries({ name, column, data, points, color }: ChartSeriesProps): ChartSeriesNode {
  return { kind: 'chart-series', name, column, data, points, color }
}
