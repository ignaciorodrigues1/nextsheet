import type { RowNode, SectionNode, SectionProps } from '../types/index.js'

function isRowNode(v: unknown): v is RowNode {
  return typeof v === 'object' && v !== null && (v as RowNode).kind === 'row'
}

export function Section({ title, children }: SectionProps): SectionNode {
  const raw = Array.isArray(children) ? children : children !== undefined ? [children] : []
  const rows = raw.flat().filter(isRowNode)
  return { kind: 'section', title, rows }
}
