import { getTranslations } from 'next-intl/server'

export default async function HowItWorks() {
  const t = await getTranslations('howItWorks')
  return (
    <section id="how">
      <div className="container">
        <div className="section-head">
          <div className="kicker"><span className="n">03</span> {t('kicker').replace('03 ', '')}</div>
          <div>
            <h2>{t('h2')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t.raw('p') as string }} />
          </div>
        </div>

        <div className="pipe">
          <div className="node">
            <div className="ic">tsx</div>
            <div className="tag">{t('node1_tag')}</div>
            <div className="t">{t('node1_t')}</div>
            <div className="d">
              <code className="mono" style={{ color: 'var(--fg-2)' }}>&lt;Sheet&gt;</code>,{' '}
              <code className="mono" style={{ color: 'var(--fg-2)' }}>&lt;Column&gt;</code>,{' '}
              <code className="mono" style={{ color: 'var(--fg-2)' }}>&lt;Row&gt;</code>,{' '}
              <code className="mono" style={{ color: 'var(--fg-2)' }}>&lt;Cell&gt;</code> —{' '}
              {t('node1_d')}
            </div>
          </div>
          <div className="arrow">→</div>
          <div className="node">
            <div className="ic">∴</div>
            <div className="tag">{t('node2_tag')}</div>
            <div className="t">{t('node2_t')}</div>
            <div className="d">{t('node2_d')}</div>
          </div>
          <div className="arrow">→</div>
          <div className="node">
            <div className="ic">&lt;/&gt;</div>
            <div className="tag">{t('node3_tag')}</div>
            <div className="t">{t('node3_t')}</div>
            <div className="d">{t('node3_d')}</div>
          </div>
        </div>

        <div className="pipe" style={{ marginTop: 12, gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div className="node">
            <div className="ic">T</div>
            <div className="tag">{t('node4_tag')}</div>
            <div className="t">{t('node4_t')}</div>
            <div className="d" dangerouslySetInnerHTML={{ __html: t.raw('node4_d') as string }} />
          </div>
          <div className="node">
            <div className="ic">↻</div>
            <div className="tag">{t('node5_tag')}</div>
            <div className="t">{t('node5_t')}</div>
            <div className="d">{t('node5_d')}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
