import type { CellNode, RowNode, RowProps } from '../types/index.js'

function isCellNode(v: unknown): v is CellNode {
  return typeof v === 'object' && v !== null && (v as CellNode).kind === 'cell'
}

export function Row({ children, header }: RowProps): RowNode {
  const raw = Array.isArray(children) ? children : children !== undefined ? [children] : []
  const cells = raw.flat().filter(isCellNode)
  return { kind: 'row', header, cells }
}
