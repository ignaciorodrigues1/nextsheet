import type { SheetDefinition, SheetNode, WorkbookNode } from '../types/index.js'

type SheetInput = SheetDefinition | SheetNode | (() => SheetNode)

function isSheetDefinition(input: SheetInput): input is SheetDefinition {
  return typeof input !== 'function' && '_type' in input && input._type === 'SheetDefinition'
}

function resolveSheet(input: SheetInput): SheetNode {
  if (typeof input === 'function') return input()
  if (isSheetDefinition(input)) {
    const node = input.render() as SheetNode
    // The definition name takes precedence over the Sheet component's default.
    return node.name === 'Sheet' ? { ...node, name: input.name } : node
  }
  return input as SheetNode
}

/**
 * Assembles multiple sheets into a single workbook IR.
 *
 * @example
 * const wb = workbook('Finance 2026', [Invoices, Expenses])
 * await csvAdapter.render(wb)
 */
export function workbook(name: string, sheets: SheetInput[]): WorkbookNode {
  return {
    kind: 'workbook',
    name,
    sheets: sheets.map(resolveSheet),
  }
}
