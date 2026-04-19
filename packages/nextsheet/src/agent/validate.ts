import Ajv from 'ajv'
import { patchSchema, workbookSchema } from './schema.js'

// ─── Validators (compiled once at module load) ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AjvClass = (Ajv as any).default ?? Ajv
const ajv = new AjvClass({ allErrors: true })
const _validatePatch    = ajv.compile(patchSchema)
const _validateWorkbook = ajv.compile(workbookSchema)

// ─── Result type ─────────────────────────────────────────────────────────────

export interface ValidationResult {
  /** Whether the input conforms to the schema. */
  readonly valid: boolean
  /** Human-readable error messages. Empty when valid. */
  readonly errors: string[]
}

function toResult(valid: boolean, rawErrors: unknown[] | null | undefined): ValidationResult {
  if (valid) return { valid: true, errors: [] }
  const errors = (rawErrors ?? []).map((e: unknown) => {
    const err = e as { instancePath?: string; message?: string }
    const path = err.instancePath ? err.instancePath.replace(/^\//, '') : 'root'
    return `${path}: ${err.message}`
  })
  return { valid: false, errors }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validate an unknown value against the PatchOperation JSON Schema.
 *
 * Use this to check LLM output before passing it to `applyPatch()`.
 *
 * @example
 * const result = validatePatch(agentOutput)
 * if (!result.valid) {
 *   console.error('Invalid patch:', result.errors)
 * } else {
 *   builder.applyPatch(agentOutput as PatchOperation)
 * }
 */
export function validatePatch(op: unknown): ValidationResult {
  const valid = _validatePatch(op) as boolean
  return toResult(valid, (_validatePatch as { errors?: unknown[] | null }).errors)
}

/**
 * Validate an unknown value against the WorkbookNode JSON Schema.
 *
 * Use this to check LLM output from `create_workbook` tool calls.
 *
 * @example
 * const result = validateWorkbook(agentOutput)
 * if (result.valid) {
 *   const node = agentOutput as WorkbookNode
 *   const xlsx = await xlsxAdapter(node)
 * }
 */
export function validateWorkbook(wb: unknown): ValidationResult {
  const valid = _validateWorkbook(wb) as boolean
  return toResult(valid, (_validateWorkbook as { errors?: unknown[] | null }).errors)
}

/**
 * Validate an array of patch operations, returning the first invalid one.
 * Returns `{ valid: true }` only if every operation passes.
 *
 * @example
 * const result = validatePatches(agentPatches)
 * if (!result.valid) throw new Error(`Patch[${result.index}] failed: ${result.errors}`)
 */
export function validatePatches(ops: unknown[]): ValidationResult & { index?: number } {
  for (let i = 0; i < ops.length; i++) {
    const r = validatePatch(ops[i])
    if (!r.valid) return { ...r, index: i }
  }
  return { valid: true, errors: [] }
}
