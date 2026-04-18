import type { CellNode, CellProps, FormulaNode } from '../types/index.js'

function isFormulaNode(v: unknown): v is FormulaNode {
  return typeof v === 'object' && v !== null && (v as FormulaNode).kind === 'formula'
}

export function Cell({ children, format, color, bold, colspan }: CellProps): CellNode {
  if (isFormulaNode(children)) {
    return { kind: 'cell', formula: children.expression, format, color, bold, colspan }
  }
  return {
    kind: 'cell',
    value: children as CellNode['value'],
    format,
    color,
    bold,
    colspan,
  }
}
