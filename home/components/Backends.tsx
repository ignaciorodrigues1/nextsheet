const backends = [
  {
    name: 'Google Sheets',
    accentBorder: true,
    status: 'Estable',
    desc: 'Sync bidireccional vía OAuth. Fórmulas nativas, no imágenes. Colaboradores ven celdas — no código.',
    cmd: 'nextsheet deploy --target google',
  },
  {
    name: 'Excel Online',
    accentBorder: true,
    status: 'Estable',
    desc: 'Microsoft Graph. Push a SharePoint o OneDrive. Funciona con cuentas corporativas sin add-ins.',
    cmd: 'nextsheet deploy --target excel-online',
  },
  {
    name: '.xlsx estático',
    accentBorder: true,
    status: 'Estable',
    desc: 'Binario OOXML generado en build. Ideal para emails, reportes, distribución offline y auditoría.',
    cmd: 'nextsheet build --target xlsx',
  },
  {
    name: '.csv / .tsv',
    accentBorder: true,
    status: 'Estable',
    desc: 'Flatten a tabular, listo para ingestar en BigQuery, Snowflake, Redshift. Escape automático, encoding UTF-8.',
    cmd: 'nextsheet build --target csv',
  },
  {
    name: 'SuperSheet',
    accentBorder: true,
    status: 'Estable',
    desc: 'Deploy a la plataforma hosted de NextSheet. URL compartible, diff por PR, preview ephemeral.',
    cmd: 'nextsheet deploy --target supersheet',
  },
  {
    name: 'Agent API',
    accentBorder: false,
    status: 'Nuevo · v0.5',
    desc: 'WorkbookBuilder fluent + applyPatch(). JSON schemas para LLMs. toAnthropicTools() / toOpenAITools().',
    cmd: "import { wb } from 'nextsheet/agent'",
  },
]

export default function Backends() {
  return (
    <section id="backends">
      <div className="container">
        <div className="section-head">
          <div className="kicker"><span className="n">04</span> Backends &amp; targets</div>
          <div>
            <h2>Escribí una vez. Deployá a donde el negocio ya está.</h2>
            <p>
              El CFO abre Excel. Marketing abre Sheets. Finanzas vive en PDFs auditados.
              NextSheet compila a todas las superficies donde tus usuarios ya trabajan —{' '}
              <strong>sin migrarlos a un producto nuevo</strong>.
            </p>
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
