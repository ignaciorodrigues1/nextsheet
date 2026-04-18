import type { FormulaNode, FormulaProps } from '../types/index.js'

export function Formula({ children }: FormulaProps): FormulaNode {
  const expression =
    typeof children === 'string'
      ? children
      : children == null
        ? ''
        : String(children)
  return { kind: 'formula', expression }
}
