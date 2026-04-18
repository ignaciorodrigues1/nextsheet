import type { ColumnNode, ColumnProps, ColumnType, FormulaNode } from '../types.js'

export function Column<T extends ColumnType = ColumnType>({
  name,
  type,
  primary,
  required,
  default: defaultValue,
  formula,
  currency,
  format,
}: ColumnProps<T>): ColumnNode {
  let resolvedFormula: string | undefined

  if (formula !== undefined) {
    // Build a proxy so each column-name ref stringifies to its own name.
    // Adapters later map column names → actual cell addresses.
    const colProxy = new Proxy({} as Record<string, string>, {
      get: (_, prop) => String(prop),
    })
    const formulaNode = formula(colProxy) as FormulaNode
    resolvedFormula = formulaNode.expression
  }

  return {
    kind: 'column',
    name,
    type,
    ...(primary !== undefined && { primary }),
    ...(required !== undefined && { required }),
    ...(defaultValue !== undefined && { default: defaultValue }),
    ...(resolvedFormula !== undefined && { formula: resolvedFormula }),
    ...(currency !== undefined && { currency }),
    ...(format !== undefined && { format }),
  }
}
