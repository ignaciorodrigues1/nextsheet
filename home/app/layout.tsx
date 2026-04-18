import type { Metadata } from 'next'
import { Inter_Tight, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jb-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NextSheet — El framework para la era de la hoja de cálculo',
  description:
    'Build, version, and deploy spreadsheet apps using components, TypeScript, and a CLI. One codebase → Google Sheets, Excel, CSV, and more.',
  openGraph: {
    title: 'NextSheet — El framework para la era de la hoja de cálculo',
    description: 'Componentes, tipos de punta a punta, versión en Git, deploy a cualquier superficie.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
