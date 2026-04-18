import type { SheetDefinition, SheetNode } from '../types.js'

/**
 * Marks a render function as a named sheet definition.
 *
 * @example
 * export default defineSheet('Invoices 2026', () => (
 *   <Sheet>
 *     <Column name="id"     type="number" primary />
 *     <Column name="client" type="string" required />
 *   </Sheet>
 * ))
 */
export function defineSheet(name: string, render: () => unknown): SheetDefinition {
  return { _type: 'SheetDefinition', name, render }
}
