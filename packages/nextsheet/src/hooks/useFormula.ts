/**
 * Evaluates a JavaScript expression as a spreadsheet formula.
 *
 * During static builds the function is called immediately in JS.
 * When targeting xlsx / Google Sheets the expression is transpiled to
 * the native formula language of the adapter (v0.2+).
 *
 * @example
 * const total = useFormula(() => sales.reduce((s, r) => s + r.amount, 0))
 */
export function useFormula<T>(fn: () => T): T {
  return fn()
}
