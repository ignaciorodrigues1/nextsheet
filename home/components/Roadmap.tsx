import { getTranslations } from 'next-intl/server'

const doneFlags = [true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false]

export default async function Roadmap() {
  const t = await getTranslations('roadmap')
  const items = t.raw('items') as string[]

  const phases = [
    { label: t('q1_label'), live: true,  items: items.slice(0, 6).map((text, i) => ({ done: doneFlags[i], text })) },
    { label: t('q2_label'), live: false, items: items.slice(6, 10).map((text, i) => ({ done: doneFlags[6 + i], text })) },
    { label: t('q3_label'), live: false, items: items.slice(10, 14).map((text, i) => ({ done: doneFlags[10 + i], text })) },
    { label: t('q4_label'), live: false, items: items.slice(14, 18).map((text, i) => ({ done: doneFlags[14 + i], text })) },
  ]

  return (
    <section id="roadmap">
      <div className="container">
        <div className="section-head">
          <div className="kicker"><span className="n">08</span> {t('kicker').replace('07 ', '')}</div>
          <div>
            <h2>{t('h2')}</h2>
            <p>{t('p')}</p>
          </div>
        </div>

        <div className="roadmap">
          {phases.map((phase) => (
            <div className="rm" key={phase.label}>
              <div className={`q${phase.live ? ' live' : ''}`}>{phase.label}</div>
              <ul>
                {phase.items.map((item) => (
                  <li key={item.text} className={item.done ? 'done' : ''}>
                    <span className="mk">{item.done ? '●' : '○'}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
