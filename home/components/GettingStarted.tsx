const terminalHtml = `<span class="hl-cmt"># crea un proyecto nuevo</span>
<span class="hl-gn">$</span> npx create-nextsheet-app revenue-model
<span class="hl-cmt">  ✓ TypeScript</span>
<span class="hl-cmt">  ✓ ESLint configurado</span>
<span class="hl-cmt">  ✓ Git repo inicializado</span>

<span class="hl-gn">$</span> cd revenue-model && pnpm dev
<span class="hl-cmt">  ▲ NextSheet 0.4.0</span>
<span class="hl-cmt">  - local:    http://localhost:3000</span>
<span class="hl-cmt">  - sheet:    file://./dist/forecast.xlsx</span>
<span class="hl-cmt">  - types:    generating ./types/cells.d.ts</span>
<span class="hl-cmt">  ✓ compiled in 142ms</span>`

const codeHtml = `<span class="hl-kw">import</span> { <span class="hl-var">Sheet</span>, <span class="hl-var">Column</span>, <span class="hl-var">Row</span>, <span class="hl-var">Cell</span> } <span class="hl-kw">from</span> <span class="hl-str">'nextsheet'</span>

<span class="hl-kw">export default function</span> <span class="hl-fn">Revenue</span>() {
  <span class="hl-kw">const</span> <span class="hl-var">rows</span> = [
    { <span class="hl-var">region</span>: <span class="hl-str">'NA'</span>,    <span class="hl-var">rev</span>: <span class="hl-num">3_107_520</span> },
    { <span class="hl-var">region</span>: <span class="hl-str">'EMEA'</span>,  <span class="hl-var">rev</span>: <span class="hl-num">2_134_280</span> },
    { <span class="hl-var">region</span>: <span class="hl-str">'LATAM'</span>, <span class="hl-var">rev</span>: <span class="hl-num">775_845</span>   },
  ]
  <span class="hl-kw">return</span> (
    &lt;<span class="hl-tag">Sheet</span> <span class="hl-var">name</span>=<span class="hl-str">"Revenue"</span>&gt;
      &lt;<span class="hl-tag">Column</span> <span class="hl-var">name</span>=<span class="hl-str">"region"</span> <span class="hl-var">type</span>=<span class="hl-str">"string"</span> <span class="hl-var">primary</span> /&gt;
      &lt;<span class="hl-tag">Column</span> <span class="hl-var">name</span>=<span class="hl-str">"revenue"</span> <span class="hl-var">type</span>=<span class="hl-str">"currency"</span> <span class="hl-var">currency</span>=<span class="hl-str">"USD"</span> /&gt;
      {<span class="hl-var">rows</span>.<span class="hl-fn">map</span>(<span class="hl-var">r</span> =&gt; (
        &lt;<span class="hl-tag">Row</span> <span class="hl-var">key</span>={<span class="hl-var">r</span>.<span class="hl-var">region</span>}&gt;
          &lt;<span class="hl-tag">Cell</span>&gt;{<span class="hl-var">r</span>.<span class="hl-var">region</span>}&lt;/<span class="hl-tag">Cell</span>&gt;
          &lt;<span class="hl-tag">Cell</span>&gt;{<span class="hl-var">r</span>.<span class="hl-var">rev</span>}&lt;/<span class="hl-tag">Cell</span>&gt;
        &lt;/<span class="hl-tag">Row</span>&gt;
      ))}
    &lt;/<span class="hl-tag">Sheet</span>&gt;
  )
}`

export default function GettingStarted() {
  return (
    <section id="start">
      <div className="container">
        <div className="section-head">
          <div className="kicker"><span className="n">02</span> Empezar</div>
          <div>
            <h2>Desde cero a un .xlsx tipado en <span style={{ color: 'var(--accent)' }}>30 segundos</span>.</h2>
            <p>
              Una sola dependencia. Autoría local-first. Compila a todas las superficies —{' '}
              <strong>Google Sheets, Excel Online, .xlsx, .csv</strong> — desde el mismo código fuente.
            </p>
          </div>
        </div>

        <div className="feature-row">
          <div className="codeblock">
            <div className="hd">
              <div className="dots"><i /><i /><i /></div>
              <span>terminal — ~/projects</span>
            </div>
            <pre dangerouslySetInnerHTML={{ __html: terminalHtml }} />
          </div>
          <div className="codeblock">
            <div className="hd">
              <div className="dots"><i /><i /><i /></div>
              <span>sheets/Revenue.sheet.tsx</span>
            </div>
            <pre dangerouslySetInnerHTML={{ __html: codeHtml }} />
          </div>
        </div>
      </div>
    </section>
  )
}
