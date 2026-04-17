import { readRange } from '../runtime/range-context.js'

/**
 * Reads a typed range from the connected spreadsheet backend.
 *
 * During static builds (no backend configured) returns []. When the CLI
 * is connected to a live backend via `--target google` or `--target excel-online`,
 * data is pre-fetched and injected before rendering.
 *
 * @example
 * const sales = useRange<Sale>('Sales!A2:D')
 */
export function useRange<T = Record<string, unknown>>(address: string): T[] {
  return readRange<T>(address)
}
