'use client'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

const localeLabels = { en: 'EN', es: 'ES', fr: 'FR' }

export default function Nav() {
  const [open, setOpen] = useState(false)
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(next: string) {
    const segments = pathname.split('/')
    segments[1] = next
    router.push(segments.join('/') || '/')
  }

  return (
    <nav className="top">
      <div className="container row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#" className="logo">
            <span className="mark" />
            <span className="brand">NextSheet <em>v0.4.0</em></span>
          </a>
          <ul className="nav-links">
            <li><a href="#start">{t('getStarted')}</a></li>
            <li><a href="#how">{t('howItWorks')}</a></li>
            <li><a href="#roadmap">{t('roadmap')}</a></li>
          </ul>
        </div>
        <div className="actions">
          <a className="btn desk-only" href="https://github.com/ignaciorodrigues1/nextsheet" target="_blank" rel="noopener">
            {t('github')}
          </a>
          <a className="btn desk-only" href="https://www.npmjs.com/package/nextsheet" target="_blank" rel="noopener">
            {t('npm')}
          </a>
          <div className="locale-switcher">
            {(['en', 'es', 'fr'] as const).map((l) => (
              <button
                key={l}
                className={`locale-btn${locale === l ? ' active' : ''}`}
                onClick={() => switchLocale(l)}
              >
                {localeLabels[l]}
              </button>
            ))}
          </div>
          <a className="btn primary" href="#start">
            <span className="mono">{t('install')}</span>
          </a>
          <button
            className={`nav-toggle${open ? ' on' : ''}`}
            id="navToggle"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className={`mobile-menu${open ? ' open' : ''}`}>
        <a href="#start" onClick={() => setOpen(false)}>{t('getStarted')}</a>
        <a href="#how" onClick={() => setOpen(false)}>{t('howItWorks')}</a>
        <a href="#roadmap" onClick={() => setOpen(false)}>{t('roadmap')}</a>
        <a href="https://github.com/ignaciorodrigues1/nextsheet" target="_blank" rel="noopener">{t('github')}</a>
        <a href="https://www.npmjs.com/package/nextsheet" target="_blank" rel="noopener">{t('npm')}</a>
        <div style={{ display: 'flex', gap: 8, padding: '8px 0' }}>
          {(['en', 'es', 'fr'] as const).map((l) => (
            <button
              key={l}
              className={`locale-btn${locale === l ? ' active' : ''}`}
              onClick={() => { switchLocale(l); setOpen(false) }}
            >
              {localeLabels[l]}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
