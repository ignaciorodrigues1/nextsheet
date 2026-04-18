/**
 * Internal marker for formula expressions built in formula mode.
 * valueOf() returns 0 so arithmetic expressions degrade gracefully in JS mode.
 */
export class FormulaRef {
  constructor(public readonly expr: string) {}
  valueOf(): number { return 0 }
  toString(): string { return this.expr }
}

export function isFormulaRef(v: unknown): v is FormulaRef {
  return v instanceof FormulaRef
}

export function toExpr(v: unknown): string {
  if (isFormulaRef(v)) return v.expr
  if (Array.isArray(v)) return v.map(toExpr).join(', ')
  return String(v)
}
