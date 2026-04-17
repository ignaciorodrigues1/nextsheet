/**
 * Reads a typed range from the connected spreadsheet backend.
 *
 * Available when NextSheet is connected to a live backend (Google Sheets,
 * Excel Online). Throws during static build — use adapter `data` option instead.
 *
 * @example
 * const sales = useRange<Sale>('Sales!A2:D')
 */
export function useRange<T>(_rangeAddress: string): T[] {
  throw new Error(
    '[nextsheet] useRange requires a live backend connection (v0.3+). ' +
      'For static generation, pass data through the adapter build options.'
  )
}
