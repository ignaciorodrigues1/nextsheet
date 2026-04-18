export default function HowItWorks() {
  return (
    <section id="how">
      <div className="container">
        <div className="section-head">
          <div className="kicker"><span className="n">03</span> Cómo funciona</div>
          <div>
            <h2>Un pipeline, cinco primitivas, infinitas superficies.</h2>
            <p>
              NextSheet no reemplaza a Excel ni a Sheets.{' '}
              <strong>Los trata como targets de compilación</strong>, del mismo modo que Next.js trata
              al navegador como uno más. Escribís componentes. El compilador resuelve referencias,
              tipa las celdas, y emite para la superficie que pidas.
            </p>
          </div>
        </div>

        <div className="pipe">
          <div className="node">
            <div className="ic">tsx</div>
            <div className="tag">Source</div>
            <div className="t">Componentes</div>
            <div className="d">
              <code className="mono" style={{ color: 'var(--fg-2)' }}>&lt;Sheet&gt;</code>,{' '}
              <code className="mono" style={{ color: 'var(--fg-2)' }}>&lt;Column&gt;</code>,{' '}
              <code className="mono" style={{ color: 'var(--fg-2)' }}>&lt;Row&gt;</code>,{' '}
              <code className="mono" style={{ color: 'var(--fg-2)' }}>&lt;Cell&gt;</code> —
              JSX tipado, reglas de negocio como funciones puras.
            </div>
          </div>
          <div className="arrow">→</div>
          <div className="node">
            <div className="ic">∴</div>
            <div className="tag">Resolver</div>
            <div className="t">Grafo de celdas</div>
            <div className="d">Analiza dependencias, detecta ciclos, congela el orden de evaluación.</div>
          </div>
          <div className="arrow">→</div>
          <div className="node">
            <div className="ic">&lt;/&gt;</div>
            <div className="tag">Codegen</div>
            <div className="t">Emisor multi-target</div>
            <div className="d">Google Sheets API · Excel OOXML · .xlsx binario · .csv · JSON. Un AST, cinco backends.</div>
          </div>
        </div>

        <div className="pipe" style={{ marginTop: 12, gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div className="node">
            <div className="ic">T</div>
            <div className="tag">Type-check</div>
            <div className="t">Tipos de punta a punta, incluso en fórmulas</div>
            <div className="d">
              Si <code className="mono" style={{ color: 'var(--fg-2)' }}>amount</code> es{' '}
              <code className="mono" style={{ color: 'var(--fg-2)' }}>currency</code>, sumarlo
              con un string es un error de compilación — no un{' '}
              <code className="mono" style={{ color: 'var(--fg-2)' }}>#VALUE!</code> a las 3 AM.
            </div>
          </div>
          <div className="node">
            <div className="ic">↻</div>
            <div className="tag">Runtime</div>
            <div className="t">Live sync con cualquier backend</div>
            <div className="d">
              Cambiá el código, el .xlsx en producción se actualiza. Git como fuente de verdad, no el archivo.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
