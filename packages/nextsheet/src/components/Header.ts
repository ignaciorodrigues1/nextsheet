import type { HeaderNode, HeaderProps } from '../types.js'

export function Header({ title, subtitle }: HeaderProps): HeaderNode {
  return { kind: 'header', title, subtitle }
}
