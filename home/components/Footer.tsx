import { getTranslations } from 'next-intl/server'

export default async function Footer() {
  const t = await getTranslations('footer')
  return (
    <footer>
      <div className="container">
        <div className="top">
          <div className="brand-col">
            <div className="logo">
              <span className="mark" />
              <span className="brand">NextSheet</span>
            </div>
            <p>{t('tagline')}</p>
          </div>
          <div>
            <h5>{t('col1')}</h5>
            <ul>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet" target="_blank" rel="noopener">{t('docs')}</a></li>
              <li><a href="https://www.npmjs.com/package/nextsheet-cli" target="_blank" rel="noopener">{t('cli')}</a></li>
              <li><a href="https://www.npmjs.com/package/nextsheet" target="_blank" rel="noopener">npm</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/releases" target="_blank" rel="noopener">{t('changelog')}</a></li>
            </ul>
          </div>
          <div>
            <h5>{t('col2')}</h5>
            <ul>
              <li><a href="#thesis">{t('thesis')}</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet" target="_blank" rel="noopener">{t('rfcs')}</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/tree/main/examples" target="_blank" rel="noopener">{t('examples')}</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/blob/main/README.md" target="_blank" rel="noopener">README</a></li>
            </ul>
          </div>
          <div>
            <h5>{t('col3')}</h5>
            <ul>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet" target="_blank" rel="noopener">GitHub</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/discussions" target="_blank" rel="noopener">{t('discussions')}</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/issues" target="_blank" rel="noopener">{t('issues')}</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">{t('contribute')}</a></li>
            </ul>
          </div>
          <div>
            <h5>{t('col4')}</h5>
            <ul>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/blob/main/LICENSE" target="_blank" rel="noopener">{t('license')}</a></li>
              <li><a href="#">{t('privacy')}</a></li>
              <li><a href="#">{t('brand')}</a></li>
            </ul>
          </div>
        </div>
        <div className="bottom">
          <div className="mono">© 2026 NextSheet · v0.4.0 · MIT</div>
          <div className="mono" style={{ color: 'var(--fg-4)' }}>build: 761d498 · {t('shipped')}</div>
        </div>
      </div>
    </footer>
  )
}
