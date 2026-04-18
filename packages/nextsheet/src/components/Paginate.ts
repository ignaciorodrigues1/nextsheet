import type { PaginateNode, PaginateProps } from '../types/index.js'

export function Paginate({ pageSize, initialPage = 1 }: PaginateProps): PaginateNode {
  return { kind: 'paginate', pageSize, initialPage }
}
