// ─── Hook return types ─────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc'

export type FilterOperator = '==' | '!=' | '<' | '<=' | '>' | '>='

/**
 * Chainable query builder returned by `useQuery()` and `useRange()`.
 *
 * @example
 * ```tsx
 * const top5 = useQuery(rows)
 *   .where('status', '==', 'active')
 *   .orderBy('revenue', 'desc')
 *   .limit(5)
 *   .toArray()
 * ```
 */
export interface RangeQuery<T> {
  /** Filter rows where `field op value` is true. Chainable. */
  where(field: keyof T, op: FilterOperator, value: unknown): RangeQuery<T>
  /** Sort rows by `field`. Chainable. Multiple calls stack (last wins). */
  orderBy(field: keyof T, direction?: SortDirection): RangeQuery<T>
  /** Return at most `n` rows. Chainable. */
  limit(n: number): RangeQuery<T>
  /** Return the first matching row, or `undefined` if none. */
  first(): T | undefined
  /** Materialize the query and return all matching rows as an array. */
  toArray(): T[]
}

/**
 * Options accepted by `useRange()` live-backend hook.
 */
export interface UseRangeOptions {
  /**
   * Cache-bust key — when this value changes the range is re-fetched
   * from the live backend. Useful for dependency-driven refreshes.
   */
  readonly cacheKey?: string | number
}
