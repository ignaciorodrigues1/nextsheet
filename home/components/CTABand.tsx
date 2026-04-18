'use client'
import { useEffect, useRef } from 'react'

const sbCodeHtml = `<span class="hl-cmt">// sheets/Sales.sheet.tsx</span>
<span class="hl-kw">import</span> { <span class="hl-var">Sheet</span>, <span class="hl-var">Column</span>, <span class="hl-var">Row</span>, <span class="hl-var">Cell</span> } <span class="hl-kw">from</span> <span class="hl-str">'nextsheet'</span>
<span class="hl-kw">import</span> { <span class="hl-var">revenue</span>, <span class="hl-var">growth</span> } <span class="hl-kw">from</span> <span class="hl-str">'@/data'</span>

<span class="hl-kw">export default function</span> <span class="hl-fn">Sales</span>() {
  <span class="hl-kw">return</span> (
    &lt;<span class="hl-tag">Sheet</span> <span class="hl-var">name</span>=<span class="hl-str">"Q3"</span>&gt;
      &lt;<span class="hl-tag">Column</span> <span class="hl-var">name</span>=<span class="hl-str">"region"</span>  <span class="hl-var">type</span>=<span class="hl-str">"string"</span>   <span class="hl-var">primary</span> /&gt;
      &lt;<span class="hl-tag">Column</span> <span class="hl-var">name</span>=<span class="hl-str">"units"</span>   <span class="hl-var">type</span>=<span class="hl-str">"number"</span>            /&gt;
      &lt;<span class="hl-tag">Column</span> <span class="hl-var">name</span>=<span class="hl-str">"revenue"</span> <span class="hl-var">type</span>=<span class="hl-str">"currency"</span> <span class="hl-var">currency</span>=<span class="hl-str">"USD"</span> /&gt;
      {<span class="hl-var">revenue</span>.<span class="hl-fn">byRegion</span>.<span class="hl-fn">map</span>(<span class="hl-var">r</span> =&gt; (
        &lt;<span class="hl-tag">Row</span> <span class="hl-var">key</span>={<span class="hl-var">r</span>.<span class="hl-var">region</span>}&gt;
          &lt;<span class="hl-tag">Cell</span>&gt;{<span class="hl-var">r</span>.<span class="hl-var">region</span>}&lt;/<span class="hl-tag">Cell</span>&gt;
          &lt;<span class="hl-tag">Cell</span>&gt;{<span class="hl-var">r</span>.<span class="hl-var">units</span>}&lt;/<span class="hl-tag">Cell</span>&gt;
          &lt;<span class="hl-tag">Cell</span>&gt;{<span class="hl-var">r</span>.<span class="hl-var">rev</span> * (<span class="hl-num">1</span> + <span class="hl-var">growth</span>)}&lt;/<span class="hl-tag">Cell</span>&gt;
        &lt;/<span class="hl-tag">Row</span>&gt;
      ))}
    &lt;/<span class="hl-tag">Sheet</span>&gt;
  )
}`

export default function CTABand() {
  const bodyRef   = useRef<HTMLDivElement>(null)
  const sheetRef  = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const body   = bodyRef.current
    const sheet  = sheetRef.current
    const handle = handleRef.current
    if (!body || !sheet || !handle) return

    let dragging = false

    function setPos(clientX: number) {
      const rect = body!.getBoundingClientRect()
      let x = clientX - rect.left
      x = Math.max(24, Math.min(rect.width - 24, x))
      const pct = (x / rect.width) * 100
      sheet!.style.width = `${100 - pct}%`
      handle!.style.left = `${pct}%`
    }

    const start = (e: MouseEvent | TouchEvent) => {
      dragging = true
      document.body.style.cursor = 'col-resize'
      e.preventDefault()
    }
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX
      setPos(x)
    }
    const end = () => {
      dragging = false
      document.body.style.cursor = ''
    }

    handle.addEventListener('mousedown', start as EventListener)
    handle.addEventListener('touchstart', start as EventListener, { passive: false })
    window.addEventListener('mousemove', move as EventListener)
    window.addEventListener('touchmove', move as EventListener, { passive: true })
    window.addEventListener('mouseup', end)
    window.addEventListener('touchend', end)

    body.addEventListener('click', (e: MouseEvent) => {
      if (e.target === handle || handle.contains(e.target as Node)) return
      setPos(e.clientX)
    })

    handle.addEventListener('keydown', (e: KeyboardEvent) => {
      const rect = body!.getBoundingClientRect()
      const cur = parseFloat(handle!.style.left || '50')
      const step = 4
      if (e.key === 'ArrowLeft')  setPos(rect.left + rect.width * (cur - step) / 100)
      if (e.key === 'ArrowRight') setPos(rect.left + rect.width * (cur + step) / 100)
    })

    return () => {
      window.removeEventListener('mousemove', move as EventListener)
      window.removeEventListener('touchmove', move as EventListener)
      window.removeEventListener('mouseup', end)
      window.removeEventListener('touchend', end)
    }
  }, [])

  return (
    <section className="cta-band">
      <div className="bg" />
      <div className="container">
        <h2>El primer framework<br />para mil millones de autores.</h2>
        <p>Abierto, versionado, escrito en TypeScript.</p>
        <div className="cta">
          <a href="https://www.npmjs.com/package/create-nextsheet-app" className="btn primary" target="_blank" rel="noopener">
            <span className="mono">$ npm create nextsheet-app</span>
          </a>
          <a href="https://github.com/ignaciorodrigues1/nextsheet" className="btn" target="_blank" rel="noopener">
            GitHub →
          </a>
        </div>

        {/* Split browser */}
        <div className="split-browser" id="splitBrowser">
          <div className="sb-bar">
            <div className="sb-dots">
              <i style={{ background: '#ff5f57' }} />
              <i style={{ background: '#febc2e' }} />
              <i style={{ background: '#28c840' }} />
            </div>
            <div className="sb-url mono">nextsheet.dev/preview/sales.sheet.tsx</div>
            <div className="sb-spacer" />
          </div>
          <div className="sb-body" id="sbBody" ref={bodyRef}>
            {/* Code side */}
            <div className="sb-code">
              <pre className="mono" dangerouslySetInnerHTML={{ __html: sbCodeHtml }} />
            </div>
            {/* Sheet side */}
            <div className="sb-sheet" id="sbSheet" ref={sheetRef}>
              <div className="sb-sheet-inner">
                <div className="sb-formula mono">
                  <span style={{ color: 'var(--accent)', fontWeight: 500 }}>D4</span>
                  <span style={{ color: 'var(--fg-3)', fontStyle: 'italic' }}>fx</span>
                  <span>=r.rev * (1 + growth)</span>
                </div>
                <table className="sb-table">
                  <thead>
                    <tr>
                      <th style={{ width: 30 }} />
                      <th>A · region</th>
                      <th>B · units</th>
                      <th>C · price</th>
                      <th>D · revenue</th>
                      <th>E · yoy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="rh">1</td><td>North America</td><td>12,480</td><td>$249</td><td>$3,107,520</td><td className="pos">+18.2%</td></tr>
                    <tr><td className="rh">2</td><td>Europe</td><td>9,320</td><td>€229</td><td>€2,134,280</td><td className="pos">+12.4%</td></tr>
                    <tr><td className="rh">3</td><td>LATAM</td><td>4,105</td><td>$189</td><td>$775,845</td><td className="pos">+34.9%</td></tr>
                    <tr><td className="rh">4</td><td>APAC</td><td>6,870</td><td>$209</td><td className="act">$1,435,830</td><td className="pos">+22.1%</td></tr>
                    <tr><td className="rh">5</td><td>MEA</td><td>1,244</td><td>$199</td><td>$247,556</td><td className="neg">-3.1%</td></tr>
                    <tr><td className="rh">6</td><td style={{ color: 'var(--fg-4)' }}>Σ total</td><td>34,019</td><td>—</td><td className="pos">$7,701,031</td><td className="pos">+16.8%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Handle */}
            <div className="sb-handle" id="sbHandle" ref={handleRef} role="slider" aria-label="Arrastrar para comparar" tabIndex={0}>
              <div className="sb-handle-bar" />
              <div className="sb-handle-knob">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 3 L1 7 L4 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 3 L13 7 L10 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="sb-label sb-label-l mono">source · .tsx</div>
            <div className="sb-label sb-label-r mono">output · .xlsx</div>
          </div>
        </div>

        <div className="ascii-mark">/ / /</div>
      </div>
    </section>
  )
}
