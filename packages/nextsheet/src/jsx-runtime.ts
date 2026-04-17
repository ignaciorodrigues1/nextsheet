/**
 * NextSheet JSX runtime.
 *
 * Uses the React 17+ automatic JSX transform (`react-jsx` mode).
 * TypeScript resolves `jsxImportSource: "nextsheet"` to this module.
 *
 * Components are called immediately — there is no virtual DOM or reconciler.
 * This keeps the runtime trivial: JSX is just typed function composition.
 */

export type FC<P = Record<string, unknown>> = (props: P) => unknown

// jsx / jsxs / jsxDEV are the three entry points the TS compiler emits.
// We treat them identically: call function types, reject string types.

export function jsx(type: FC | string, props: Record<string, unknown>): unknown {
  if (typeof type === 'function') return type(props)
  throw new Error(
    `[nextsheet] Intrinsic JSX elements are not supported. Did you forget to import "${type}" from "nextsheet"?`
  )
}

export const jsxs = jsx
export const jsxDEV = jsx

export const Fragment = ({ children }: { children?: unknown }): unknown => children

// Namespace required by TypeScript for JSX type checking.
export namespace JSX {
  export type Element = unknown

  export interface ElementAttributesProperty {
    props: Record<string, unknown>
  }

  export interface ElementChildrenAttribute {
    children: unknown
  }

  // Prevent accidental use of intrinsic HTML elements.
  export type IntrinsicElements = Record<never, never>
}
