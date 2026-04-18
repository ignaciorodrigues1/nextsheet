/**
 * NextSheet JSX runtime.
 *
 * Uses the React 17+ automatic JSX transform (`react-jsx` mode).
 * TypeScript resolves `jsxImportSource: "nextsheet"` → this module.
 *
 * Components are called immediately — there is no virtual DOM or reconciler.
 * JSX is typed function composition; adapters consume the resulting IR nodes.
 */

import type {
  CellNode,
  ChartNode,
  ChartSeriesNode,
  ColumnNode,
  FormulaNode,
  HeaderNode,
  RowNode,
  SectionNode,
  SheetNode,
} from './types/nodes.js'

import type {
  CellProps,
  ChartProps,
  ChartSeriesProps,
  ColumnProps,
  FormulaProps,
  HeaderProps,
  PaginateProps,
  RowProps,
  SectionProps,
  SheetProps,
} from './types/components.js'

/** Union of every IR node a NextSheet component can return. */
export type NextSheetElement =
  | SheetNode
  | ColumnNode
  | SectionNode
  | RowNode
  | CellNode
  | HeaderNode
  | ChartNode
  | ChartSeriesNode
  | FormulaNode
  | null
  | undefined

export type FC<P = Record<string, unknown>> = (props: P) => unknown

export function jsx(type: FC | string, props: Record<string, unknown>): unknown {
  if (typeof type === 'function') return type(props)
  throw new Error(
    `[nextsheet] Intrinsic JSX elements are not supported. Did you forget to import "${type}" from "nextsheet"?`
  )
}

export const jsxs = jsx
export const jsxDEV = jsx

export const Fragment = ({ children }: { children?: unknown }): unknown => children

// ─── JSX namespace ────────────────────────────────────────────────────────────
// TypeScript reads this to determine valid JSX elements and their prop types.
// `IntrinsicElements` maps tag names → prop interfaces for built-in tags.
// Custom components use their own function signature — no mapping needed here.

export namespace JSX {
  /** The return type of all NextSheet JSX expressions. */
  export type Element = NextSheetElement

  /**
   * Tells TypeScript which property on a component holds its props.
   * This enables `LibraryManagedAttributes` to resolve prop types correctly.
   */
  export interface ElementAttributesProperty {
    props: {}
  }

  /** Tells TypeScript which prop holds JSX children. */
  export interface ElementChildrenAttribute {
    children: {}
  }

  /**
   * Intrinsic (HTML) elements are intentionally disabled.
   * All tags must be imported from "nextsheet".
   */
  export type IntrinsicElements = Record<never, never>

  /**
   * Named component elements — maps component functions to their prop types
   * so editors show correct completions and errors on `<Sheet>`, `<Column>`, etc.
   */
  export interface IntrinsicClassAttributes<T> {}

  // Per-component prop mappings for editor IntelliSense
  export interface LibraryManagedAttributes<C, P> {}
}

// ─── Augment global JSX for projects using `jsxImportSource: "nextsheet"` ─────
// This makes component props available to editors without any extra imports.

declare global {
  namespace NxtJSX {
    type Element = NextSheetElement
    interface IntrinsicElements extends NxtIntrinsicElements {}
  }
}

export interface NxtIntrinsicElements {
  Sheet: SheetProps
  Header: HeaderProps
  Column: ColumnProps
  Section: SectionProps
  Row: RowProps
  Cell: CellProps
  Formula: FormulaProps
  Chart: ChartProps
  ChartSeries: ChartSeriesProps
  Paginate: PaginateProps
}
