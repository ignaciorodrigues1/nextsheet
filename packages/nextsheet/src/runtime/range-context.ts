// Global state for useRange — uses globalThis so it's shared across module
// instances (the CLI imports nextsheet directly; transpiled sheet files bundle it
// inline). Both copies read/write the same globalThis key.

interface RangeCtx {
  cache: Map<string, unknown[]>
  collected: Set<string>
  collecting: boolean
}

function ctx(): RangeCtx {
  const g = globalThis as Record<string, unknown>
  if (g['__nxt_range_ctx'] === undefined) {
    g['__nxt_range_ctx'] = {
      cache: new Map<string, unknown[]>(),
      collected: new Set<string>(),
      collecting: false,
    } satisfies RangeCtx
  }
  return g['__nxt_range_ctx'] as RangeCtx
}

/** Enable collection mode — useRange() records addresses but returns []. */
export function startCollecting(): void {
  const c = ctx()
  c.collecting = true
  c.collected.clear()
}

/** Disable collection mode and return the set of collected addresses. */
export function stopCollecting(): ReadonlySet<string> {
  const c = ctx()
  c.collecting = false
  return c.collected
}

/** Populate the cache with fetched range data. */
export function populateCache(entries: ReadonlyMap<string, unknown[]>): void {
  const { cache } = ctx()
  for (const [k, v] of entries) cache.set(k, v)
}

/** Clear all cached range data (call after rendering to free memory). */
export function clearRangeCache(): void {
  ctx().cache.clear()
}

/** Read a range from cache, or collect the address in collection mode. */
export function readRange<T>(address: string): T[] {
  const c = ctx()
  if (c.collecting) {
    c.collected.add(address)
    return []
  }
  return (c.cache.get(address) ?? []) as T[]
}
