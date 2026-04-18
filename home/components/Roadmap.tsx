const phases = [
  {
    label: 'Q2 · 2026 · Ahora',
    live: true,
    items: [
      { done: true,  text: 'Core: <Sheet>, <Row>, <Cell>, <Column>' },
      { done: true,  text: 'Backends: Sheets, Excel, .xlsx, .csv' },
      { done: true,  text: 'Type-check de fórmulas' },
      { done: true,  text: 'CLI & dev server con hot reload' },
      { done: true,  text: 'Agent API (v0.5): WorkbookBuilder + applyPatch()' },
      { done: true,  text: 'Schema Inspector + column sort + search' },
    ],
  },
  {
    label: 'Q3 · 2026',
    live: false,
    items: [
      { done: false, text: 'PDF reports con paginación automática' },
      { done: false, text: 'Cell-level diff en GitHub Actions' },
      { done: false, text: 'Pivot tables como componentes' },
      { done: false, text: 'Plugin & adapter registry' },
    ],
  },
  {
    label: 'Q4 · 2026',
    live: false,
    items: [
      { done: false, text: 'SQL sinks (Postgres / BigQuery)' },
      { done: false, text: 'Runtime colaborativo (CRDT)' },
      { done: false, text: 'Enterprise SSO / audit log' },
      { done: false, text: 'Scheduled builds & delivery' },
    ],
  },
  {
    label: 'Q1 · 2027 · v1.0',
    live: false,
    items: [
      { done: false, text: 'Fórmulas tipadas genéricas' },
      { done: false, text: 'Time-series como primitiva' },
      { done: false, text: 'API pública estable (LTS)' },
      { done: false, text: 'Documentación completa en nextsheet.dev' },
    ],
  },
]

export default function Roadmap() {
  return (
    <section id="roadmap">
      <div className="container">
        <div className="section-head">
          <div className="kicker"><span className="n">07</span> Roadmap</div>
          <div>
            <h2>Público, opinado, en Git.</h2>
            <p>
              Hoy v0.4 es estable para Sheets, Excel y .xlsx, con Agent API para LLMs.
              Los próximos trimestres construyen hacia v1: fórmulas tipadas, runtime colaborativo y motor de entrega.
            </p>
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
