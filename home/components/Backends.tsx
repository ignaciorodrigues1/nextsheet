import { getTranslations } from 'next-intl/server'

export default async function Backends() {
  const t = await getTranslations('backends')

  const backends = [
    {
      name: 'Google Sheets',
      accentBorder: true,
      status: t('b1_status'),
      desc: t('b1_desc'),
      cmd: 'nextsheet deploy --target google',
    },
    {
      name: 'Excel Online',
      accentBorder: true,
      status: t('b2_status'),
      desc: t('b2_desc'),
      cmd: 'nextsheet deploy --target excel-online',
    },
    {
      name: t('b3_name'),
      accentBorder: true,
      status: t('b3_status'),
      desc: t('b3_desc'),
      cmd: 'nextsheet build --target xlsx',
    },
    {
      name: '.csv / .tsv',
      accentBorder: true,
      status: t('b4_status'),
      desc: t('b4_desc'),
      cmd: 'nextsheet build --target csv',
    },
    {
      name: 'SuperSheet',
      accentBorder: true,
      status: t('b5_status'),
      desc: t('b5_desc'),
      cmd: 'nextsheet deploy --target supersheet',
    },
    {
      name: 'Agent API',
      accentBorder: false,
      status: t('b6_status'),
      desc: t('b6_desc'),
      cmd: "import { wb } from 'nextsheet/agent'",
    },
  ]

  return (
    <section id="backends">
      <div className="container">
        <div className="section-head">
          <div className="kicker"><span className="n">04</span> {t('kicker').replace('04 ', '')}</div>
          <div>
            <h2>{t('h2')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t.raw('p') as string }} />
          </div>
        </div>

        <div className="backends">
          {backends.map((b) => (
            <div className="backend" key={b.name}>
              <div className="head">
                <div className="name">
                  <span className="sq" style={{ borderColor: b.accentBorder ? 'var(--accent)' : 'var(--fg-3)' }} />
                  {b.name}
                </div>
                <div className={`status${b.accentBorder ? '' : ' soon'}`}>
                  <span className="dot" />
                  {b.status}
                </div>
              </div>
              <div className="d">{b.desc}</div>
              <div className="cmd">{b.cmd}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
