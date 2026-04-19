import { getTranslations } from 'next-intl/server'

export default async function Thesis() {
  const t = await getTranslations('thesis')
  const p3Html = (t.raw('p3') as string)
    .replace('<green>', '<span class="green">')
    .replace('</green>', '</span>')

  return (
    <section id="thesis">
      <div className="container">
        <div className="thesis-grid">
          <div className="thesis-aside">
            <div>{t('kicker')}</div>
            <div style={{ marginTop: 8, color: 'var(--fg-4)' }}>/thesis.md</div>
          </div>
          <div className="thesis-body">
            <p dangerouslySetInnerHTML={{ __html: t.raw('p1') as string }} />
            <p dangerouslySetInnerHTML={{ __html: t.raw('p2') as string }} />
            <p dangerouslySetInnerHTML={{ __html: p3Html }} />
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="n">{t('stat1_n')}</div>
            <div className="l">{t('stat1_l')}</div>
          </div>
          <div className="stat">
            <div className="n">{t('stat2_n')}<span className="u">{t('stat2_u')}</span></div>
            <div className="l">{t('stat2_l')}</div>
          </div>
          <div className="stat">
            <div className="n">{t('stat3_n')}</div>
            <div className="l">{t('stat3_l')}</div>
          </div>
          <div className="stat">
            <div className="n">{t('stat4_n')}</div>
            <div className="l">{t('stat4_l')}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
