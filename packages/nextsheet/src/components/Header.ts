import type { HeaderNode, HeaderProps } from '../types/index.js'

export function Header({ title, subtitle }: HeaderProps): HeaderNode {
  return { kind: 'header', title, subtitle }
}
