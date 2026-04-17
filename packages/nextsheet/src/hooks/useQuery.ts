import type { RangeQuery } from '../types.js'

class QueryImpl<T> implements RangeQuery<T> {
  constructor(private data: T[]) {}

  orderBy(field: keyof T, direction: 'asc' | 'desc' = 'asc'): RangeQuery<T> {
    const sorted = [...this.data].sort((a, b) => {
      const av = a[field]
      const bv = b[field]
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return direction === 'asc' ? cmp : -cmp
    })
    return new QueryImpl(sorted)
  }

  where(
    field: keyof T,
    op: '==' | '!=' | '<' | '<=' | '>' | '>=',
    value: unknown
  ): RangeQuery<T> {
    const filtered = this.data.filter((row) => {
      const v = row[field]
      switch (op) {
        case '==': return v === value
        case '!=': return v !== value
        case '<':  return v < (value as T[keyof T])
        case '<=': return v <= (value as T[keyof T])
        case '>':  return v > (value as T[keyof T])
        case '>=': return v >= (value as T[keyof T])
      }
    })
    return new QueryImpl(filtered)
  }

  limit(n: number): RangeQuery<T> {
    return new QueryImpl(this.data.slice(0, n))
  }

  first(): T | undefined {
    return this.data[0]
  }

  toArray(): T[] {
    return [...this.data]
  }
}

/**
 * Creates a chainable query over an in-memory range.
 *
 * @example
 * const topRep = useQuery(sales).orderBy('amount', 'desc').first()
 */
export function useQuery<T>(data: T[]): RangeQuery<T> {
  return new QueryImpl(data)
}
