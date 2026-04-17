import type { Adapter, RenderResult, WorkbookNode } from '../types.js'

export abstract class BaseAdapter implements Adapter {
  abstract readonly name: string
  abstract render(workbook: WorkbookNode): Promise<RenderResult>
}

export function assertWorkbook(value: unknown): asserts value is WorkbookNode {
  if (
    typeof value !== 'object' ||
    value === null ||
    (value as WorkbookNode).kind !== 'workbook'
  ) {
    throw new TypeError('[nextsheet] Expected a WorkbookNode. Did you call workbook() first?')
  }
}
