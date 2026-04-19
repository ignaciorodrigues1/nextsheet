import type { Metadata } from 'next'
import { Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { routing } from '@/i18n/routing'
import '../globals.css'

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
  title: 'NextSheet — The framework for the spreadsheet era',
  description:
    'Build, version, and deploy spreadsheet apps using components, TypeScript, and a CLI. One codebase → Google Sheets, Excel, CSV, and more.',
  openGraph: {
    title: 'NextSheet — The framework for the spreadsheet era',
    description: 'Components, end-to-end types, Git versioning, deploy to any surface.',
    type: 'website',
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'en' | 'es' | 'fr')) {
    notFound()
  }
  const messages = await getMessages()
  return (
    <html lang={locale} className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-ZKJMS5VE9N" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-ZKJMS5VE9N');
        `}</Script>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
