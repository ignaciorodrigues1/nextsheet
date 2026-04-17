/** A live spreadsheet backend used by useRange() to fetch data at build/dev time. */
export interface Backend {
  readonly name: string
  /** Fetch a typed range. First row is used as object keys if it looks like headers. */
  fetchRange<T = Record<string, unknown>>(address: string): Promise<T[]>
}
