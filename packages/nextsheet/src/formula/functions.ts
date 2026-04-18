/**
 * Dual-mode spreadsheet formula functions.
 *
 * In formula mode (inside useFormula() when targeting xlsx / Google Sheets):
 *   SUM(col('amount'))  →  FormulaRef("SUM(A:A)")  →  cell formula "=SUM(A:A)"
 *
 * In JS mode:
 *   SUM([1, 2, 3])  →  6
 */

import { FormulaRef, isFormulaRef, toExpr } from './ref.js'
import { isFormulaMode, columnAddress } from './context.js'

type NumArg = number | number[] | FormulaRef

function hasRef(...args: unknown[]): boolean {
  return args.some((a) =>
    isFormulaRef(a) || (Array.isArray(a) && a.some(isFormulaRef))
  )
}

function flatNums(args: NumArg[]): number[] {
  return args.flatMap((a) =>
    Array.isArray(a)
      ? a.filter((n): n is number => typeof n === 'number')
      : typeof a === 'number'
        ? [a]
        : []
  )
}

/**
 * Reference a named column. In formula mode returns the whole-column address
 * (e.g. "B:B"); in JS mode returns an empty array (no live data available).
 *
 * Pair with useRange() when you need actual data in JS/preview mode.
 */
export function col(name: string): number[] | FormulaRef {
  if (isFormulaMode()) return new FormulaRef(columnAddress(name))
  return []
}

export function SUM(...args: NumArg[]): number | FormulaRef {
  if (hasRef(...args)) return new FormulaRef(`SUM(${args.map(toExpr).join(', ')})`)
  return flatNums(args).reduce((a, b) => a + b, 0)
}

export function AVERAGE(...args: NumArg[]): number | FormulaRef {
  if (hasRef(...args)) return new FormulaRef(`AVERAGE(${args.map(toExpr).join(', ')})`)
  const nums = flatNums(args)
  return nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length
}

export function COUNT(...args: NumArg[]): number | FormulaRef {
  if (hasRef(...args)) return new FormulaRef(`COUNT(${args.map(toExpr).join(', ')})`)
  return flatNums(args).length
}

export function COUNTA(...args: (number | string | null | undefined | FormulaRef)[]): number | FormulaRef {
  if (args.some(isFormulaRef)) return new FormulaRef(`COUNTA(${args.map(toExpr).join(', ')})`)
  return args.flat().filter((a) => a !== null && a !== undefined && a !== '').length
}

export function MIN(...args: NumArg[]): number | FormulaRef {
  if (hasRef(...args)) return new FormulaRef(`MIN(${args.map(toExpr).join(', ')})`)
  const nums = flatNums(args)
  return nums.length === 0 ? 0 : Math.min(...nums)
}

export function MAX(...args: NumArg[]): number | FormulaRef {
  if (hasRef(...args)) return new FormulaRef(`MAX(${args.map(toExpr).join(', ')})`)
  const nums = flatNums(args)
  return nums.length === 0 ? 0 : Math.max(...nums)
}

export function ROUND(value: NumArg, decimals = 0): number | FormulaRef {
  if (isFormulaRef(value)) return new FormulaRef(`ROUND(${value.expr}, ${decimals})`)
  const n = Array.isArray(value) ? (flatNums([value])[0] ?? 0) : value
  const factor = Math.pow(10, decimals)
  return Math.round(n * factor) / factor
}

export function IF(
  condition: boolean | FormulaRef,
  thenVal: unknown,
  elseVal: unknown
): unknown {
  if (isFormulaRef(condition)) {
    return new FormulaRef(`IF(${condition.expr}, ${toExpr(thenVal)}, ${toExpr(elseVal)})`)
  }
  return condition ? thenVal : elseVal
}

export function CONCATENATE(...args: (string | FormulaRef)[]): string | FormulaRef {
  if (args.some(isFormulaRef)) return new FormulaRef(`CONCATENATE(${args.map(toExpr).join(', ')})`)
  return args.join('')
}

export function COUNTIF(range: NumArg | string, criteria: unknown): number | FormulaRef {
  if (isFormulaRef(range)) {
    return new FormulaRef(`COUNTIF(${range.expr}, ${JSON.stringify(criteria)})`)
  }
  const arr = Array.isArray(range) ? range : []
  return arr.filter((v) => v === criteria).length
}

export function SUMIF(
  range: NumArg,
  criteria: unknown,
  sumRange?: NumArg
): number | FormulaRef {
  if (isFormulaRef(range)) {
    const parts = [range.expr, JSON.stringify(criteria)]
    if (sumRange !== undefined) parts.push(toExpr(sumRange))
    return new FormulaRef(`SUMIF(${parts.join(', ')})`)
  }
  return 0
}
