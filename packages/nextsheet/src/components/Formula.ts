import type { FormulaNode, FormulaProps } from '../types.js'

export function Formula({ children }: FormulaProps): FormulaNode {
  return { kind: 'formula', expression: children }
}
