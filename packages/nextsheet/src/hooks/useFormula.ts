/**
 * Evaluates a JavaScript expression as a spreadsheet formula.
 *
 * In JS mode (dev / static builds) the function is called immediately.
 * When targeting xlsx / Google Sheets in formula mode the expression is
 * transpiled to the native formula language via the formula helper functions.
 *
 * @example
 * import { useFormula, SUM, col } from 'nextsheet'
 *
 * // Renders as 0 in JS mode; becomes =SUM(B:B) in xlsx / Google Sheets.
 * const total = useFormula(() => SUM(col('amount')))
 */

import type { FormulaNode } from '../types.js'
import { isFormulaMode } from '../formula/context.js'
import { isFormulaRef } from '../formula/ref.js'

export function useFormula<T>(fn: () => T): T {
  if (isFormulaMode()) {
    const result = fn()
    if (isFormulaRef(result)) {
      const node: FormulaNode = { kind: 'formula', expression: result.expr }
      return node as unknown as T
    }
    return result
  }
  return fn()
}
