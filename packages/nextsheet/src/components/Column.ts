import type { ColumnNode, ColumnProps, ColumnType, FormulaNode } from '../types/index.js'

export function Column<T extends ColumnType = ColumnType>({
  name,
  type,
  primary,
  required,
  default: defaultValue,
  formula,
  currency,
  format,
  options,
}: ColumnProps<T>): ColumnNode {
  let resolvedFormula: string | undefined

  if (formula !== undefined) {
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
    ...(options !== undefined && { options }),
  }
}
