'use client'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

export default function Hero() {
  const t = useTranslations('hero')
  const termRef = useRef<HTMLDivElement>(null)
  const paneCodeRef = useRef<HTMLDivElement>(null)
  const paneSheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const out = termRef.current
    if (!out) return

    const CUR = '<span class="t-cur"></span>'
    const prompt = '<span class="t-g">~/projects</span> <span class="t-dim">$</span> '
    const frames: { html: string; hold: number; event?: string }[] = []

    frames.push({ html: prompt + CUR, hold: 500 })

    const cmd = 'npx create-nextsheet-app workbook'
    let typed = ''
    for (const ch of cmd) {
      typed += ch
      frames.push({ html: `${prompt}<span class="t-w">${typed}</span>${CUR}`, hold: 45 })
    }
    frames.push({ html: `${prompt}<span class="t-w">${typed}</span>${CUR}`, hold: 450 })

    const banner =
      `${prompt}<span class="t-w">${cmd}</span>\n` +
      '\n' +
      '<span class="t-dim"> </span><span class="t-g">create-nextsheet-app</span> <span class="t-dim2">v0.4.0</span>\n' +
      '<span class="t-dim">│</span>\n'

    frames.push({ html: `${banner}<span class="t-dim">◆</span>  <span class="t-w">Resolving registry…</span>${CUR}`, hold: 700 })
    frames.push({ html: `${banner}<span class="t-dim">◆</span>  <span class="t-w">Resolving registry…</span> <span class="t-g">ok</span>`, hold: 200 })

    const q =
      banner +
      '<span class="t-dim">◆</span>  <span class="t-w">How would you like to set up your project?</span>\n' +
      '<span class="t-dim">│</span>  <span class="t-sel">●</span> <span class="t-w">Use recommended defaults</span> <span class="t-dim">(TypeScript · ESLint · example sheets)</span>\n' +
      '<span class="t-dim">│</span>  <span class="t-dim">○ Customize settings</span>\n' +
      '<span class="t-dim">│</span>'
    frames.push({ html: `${q}${CUR}`, hold: 1400 })

    const scaffolding =
      banner +
      '<span class="t-dim">◇</span>  <span class="t-dim">Use recommended defaults</span>\n' +
      '<span class="t-dim">│</span>\n' +
      '<span class="t-dim">◆</span>  <span class="t-g">✓</span> <span class="t-dim">creating ./workbook</span>\n' +
      '<span class="t-dim">│</span>  <span class="t-g">✓</span> <span class="t-dim">installing dependencies (pnpm)</span>\n' +
      '<span class="t-dim">│</span>  <span class="t-g">✓</span> <span class="t-dim">generating types/cells.d.ts</span>\n' +
      '<span class="t-dim">│</span>  <span class="t-g">✓</span> <span class="t-dim">writing example sheets</span>\n' +
      '<span class="t-dim">│</span>'
    frames.push({ html: `${scaffolding}${CUR}`, hold: 900 })

    const box =
      scaffolding + '\n' +
      '<span class="t-box">└◇  Next steps ────────╮</span>\n' +
      '<span class="t-box">   │                  │</span>\n' +
      '<span class="t-box">   │  </span><span class="t-a">1.</span> <span class="t-w">cd workbook</span><span class="t-box">     │</span>\n' +
      '<span class="t-box">   │  </span><span class="t-a">2.</span> <span class="t-w">npm run dev</span><span class="t-box">     │</span>\n' +
      '<span class="t-box">   │                  │</span>\n' +
      '<span class="t-box">   ├──────────────────╯</span>\n' +
      '<span class="t-dim">│</span>\n' +
      '<span class="t-g">└  ✓</span> <span class="t-w">workbook is ready.</span> <span class="t-dim">Edit </span><span class="t-a">workbook/sheets/Sales.sheet.tsx</span><span class="t-dim"> to get started.</span>\n' +
      '\n' +
      '<span class="t-g">~/projects</span> <span class="t-dim">$</span> <span class="t-w">cd workbook</span>\n' +
      '<span class="t-g">~/projects/workbook</span> <span class="t-dim">$</span> '
    frames.push({ html: `${box}${CUR}`, hold: 900 })

    const devCmd = 'npm run dev'
    let devTyped = ''
    for (const ch of devCmd) {
      devTyped += ch
      frames.push({ html: `${box}<span class="t-w">${devTyped}</span>${CUR}`, hold: 60 })
    }
    frames.push({ html: `${box}<span class="t-w">${devCmd}</span>${CUR}`, hold: 400, event: 'showCode' })

    const dev =
      `${box}<span class="t-w">${devCmd}</span>\n` +
      '\n' +
      '<span class="t-dim"> </span><span class="t-g">▲</span> <span class="t-w">NextSheet</span> <span class="t-dim2">0.4.0 (dev)</span>\n' +
      '<span class="t-dim"> </span><span class="t-dim">- local:   </span><span class="t-b">http://localhost:3000</span>\n' +
      '<span class="t-dim"> </span><span class="t-dim">- sheet:   </span><span class="t-b">./dist/Sales.xlsx</span>\n' +
      '<span class="t-dim"> </span><span class="t-dim">- types:   </span><span class="t-g">./types/cells.d.ts</span>\n' +
      '\n' +
      '<span class="t-dim"> </span><span class="t-g">✓</span> <span class="t-dim">compiled </span><span class="t-w">sheets/Sales.sheet.tsx</span><span class="t-dim"> in 142ms</span>\n' +
      '<span class="t-dim"> </span><span class="t-g">✓</span> <span class="t-dim">7 rows · 5 columns · 2 formulas typed</span>\n' +
      '<span class="t-dim"> </span><span class="t-g">●</span> <span class="t-w">rendering live preview</span><span class="t-dim"> →</span>'

    frames.push({ html: `${dev}${CUR}`, hold: 1400, event: 'showSheet' })
    frames.push({ html: `${dev}\n\n<span class="t-dim"> </span><span class="t-g">✓</span> <span class="t-dim">ready in 1.8s · watching for changes</span>${CUR}`, hold: 4500, event: 'showSheet' })

    let idx = 0
    let timer: ReturnType<typeof setTimeout>

    function tick() {
      const f = frames[idx]
      if (out) out.innerHTML = f.html

      const pc = paneCodeRef.current
      const ps = paneSheetRef.current
      if (pc && ps) {
        if (f.event === 'showSheet') {
          pc.classList.remove('is-on')
          ps.classList.add('is-on')
        } else if (idx === 0) {
          ps.classList.remove('is-on')
          pc.classList.add('is-on')
        }
      }
      idx = (idx + 1) % frames.length
      timer = setTimeout(tick, f.hold)
    }
    tick()
    return () => clearTimeout(timer)
  }, [])

  function handleTabClick(view: string) {
    const grid = document.getElementById('demoGrid')
    if (!grid) return
    if (view === 'sheet') grid.style.gridTemplateColumns = '1fr 0 0'
    else if (view === 'code') grid.style.gridTemplateColumns = '0 0 1fr'
    else grid.style.gridTemplateColumns = '1fr 1px 1fr'
    document.querySelectorAll('.demo-bar .tab').forEach((t) => t.classList.remove('on'))
    const clicked = document.querySelector(`.demo-bar .tab[data-view="${view}"]`)
    clicked?.classList.add('on')
  }

  const codeHtml = `<span class="ln">1</span> <span class="hl-cmt">// sheets/Sales.sheet.tsx</span>
<span class="ln">2</span> <span class="hl-kw">import</span> { <span class="hl-var">Sheet</span>, <span class="hl-var">Row</span>, <span class="hl-var">Cell</span>, <span class="hl-var">sum</span> } <span class="hl-kw">from</span> <span class="hl-str">'nextsheet'</span>
<span class="ln">3</span> <span class="hl-kw">import</span> { <span class="hl-var">revenue</span>, <span class="hl-var">growth</span> } <span class="hl-kw">from</span> <span class="hl-str">'@/data'</span>
<span class="ln">4</span>
<span class="ln">5</span> <span class="hl-kw">export default function</span> <span class="hl-fn">Sales</span>() {
<span class="ln">6</span>   <span class="hl-kw">return</span> (
<span class="ln">7</span>     &lt;<span class="hl-tag">Sheet</span> <span class="hl-var">name</span>=<span class="hl-str">"Q3 Forecast"</span> <span class="hl-var">currency</span>=<span class="hl-str">"USD"</span>&gt;
<span class="ln">8</span>       {<span class="hl-var">revenue</span>.<span class="hl-fn">byRegion</span>.<span class="hl-fn">map</span>(<span class="hl-var">r</span> =&gt; (
<span class="ln">9</span>         &lt;<span class="hl-tag">Row</span> <span class="hl-var">key</span>={<span class="hl-var">r</span>.<span class="hl-var">region</span>}&gt;
<span class="ln">10</span>          &lt;<span class="hl-tag">Cell</span>&gt;{<span class="hl-var">r</span>.<span class="hl-var">region</span>}&lt;/<span class="hl-tag">Cell</span>&gt;
<span class="ln">11</span>          &lt;<span class="hl-tag">Cell</span>&gt;{<span class="hl-var">r</span>.<span class="hl-var">units</span>}&lt;/<span class="hl-tag">Cell</span>&gt;
<span class="ln">12</span>          &lt;<span class="hl-tag">Cell</span>&gt;{<span class="hl-var">r</span>.<span class="hl-var">price</span>}&lt;/<span class="hl-tag">Cell</span>&gt;
<span class="ln">13</span>          &lt;<span class="hl-tag">Cell</span>&gt;{<span class="hl-fn">sum</span>(<span class="hl-var">r</span>) * (<span class="hl-num">1</span> + <span class="hl-var">growth</span>)}&lt;/<span class="hl-tag">Cell</span>&gt;
<span class="ln">14</span>        &lt;/<span class="hl-tag">Row</span>&gt;
<span class="ln">15</span>      ))}
<span class="ln">16</span>    &lt;/<span class="hl-tag">Sheet</span>&gt;
<span class="ln">17</span>  )
<span class="ln">18</span> }
<span class="ln">19</span>
<span class="ln">20</span> <span class="hl-cmt">// → deploys to Sheets, Excel, .xlsx, .csv</span>`

  return (
    <header className="hero">
      <div className="grid-bg" />
      <div className="container mt-20">
        <span className="eyebrow">
          <span className="pill">v0.4</span>
          {t('eyebrow')}
          <span className="mono" style={{ color: 'var(--fg-3)' }}>→</span>
        </span>
        <h1 className="display">
          {t('h1_1')} <span className="green">{t('h1_green')}</span><br />
          {t('h1_2')}<br />
          <span className="slash">{t('h1_slash')}</span>
        </h1>
        <p className="lede" dangerouslySetInnerHTML={{ __html: t.raw('lede') as string }} />
        <div className="cta">
          <a href="#start" className="btn primary">
            <span className="mono">{t('cta_install')}</span>
          </a>
          <a href="#how" className="btn">
            {t('cta_how')}
            <span className="mono" style={{ color: 'var(--fg-3)' }}>→</span>
          </a>
          <a href="https://github.com/ignaciorodrigues1/nextsheet" className="btn" target="_blank" rel="noopener">
            <span className="mono" style={{ color: 'var(--fg-3)', fontSize: 11 }}>MIT</span>
            {t('cta_open')}
          </a>
        </div>
        <div className="meta">
          <span><span className="dot" />{t('meta_live')}</span>
          <span className="mono">{t('meta_ts')}</span>
          <span className="mono">{t('meta_node')}</span>
          <span className="mono">{t('meta_deps')}</span>
        </div>

        {/* HERO DEMO */}
        <div className="demo" id="demo">
          <div className="demo-bar">
            <div className="dots"><i /><i /><i /></div>
            <span className="path mono">~/revenue-model/sheets/q3-forecast.sheet.tsx</span>
            <div className="tabs">
              <span className="tab on" data-view="split" onClick={() => handleTabClick('split')}>{t('tab_split')}</span>
              <span className="tab" data-view="sheet" onClick={() => handleTabClick('sheet')}>{t('tab_xlsx')}</span>
              <span className="tab" data-view="code" onClick={() => handleTabClick('code')}>{t('tab_tsx')}</span>
            </div>
          </div>
          <div className="demo-grid" id="demoGrid">
            {/* LEFT: TERMINAL */}
            <div className="term" id="terminal">
              <div className="term-inner mono" ref={termRef} />
            </div>
            <div className="sep" />
            {/* RIGHT: CODE ↔ SHEET */}
            <div className="right-pane" id="rightPane">
              <div
                ref={paneCodeRef}
                className="code pane pane-code is-on"
                id="paneCode"
                dangerouslySetInnerHTML={{ __html: codeHtml }}
              />
              <div className="sheet pane pane-sheet" ref={paneSheetRef} id="paneSheet">
                <div className="formula">
                  <span className="mono cell">D4</span>
                  <span className="fx">fx</span>
                  <span className="mono">=sum(r) * (1 + growth)</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 34 }} />
                      <th>A · region</th>
                      <th>B · units</th>
                      <th>C · price</th>
                      <th>D · revenue</th>
                      <th>E · yoy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="row-h">1</td><td><span className="str">North America</span></td><td><span className="num">12,480</span></td><td><span className="num">$249</span></td><td><span className="num">$3,107,520</span></td><td><span className="pos">+18.2%</span></td></tr>
                    <tr><td className="row-h">2</td><td><span className="str">Europe</span></td><td><span className="num">9,320</span></td><td><span className="num">€229</span></td><td><span className="num">€2,134,280</span></td><td><span className="pos">+12.4%</span></td></tr>
                    <tr><td className="row-h">3</td><td><span className="str">LATAM</span></td><td><span className="num">4,105</span></td><td><span className="num">$189</span></td><td><span className="num">$775,845</span></td><td><span className="pos">+34.9%</span></td></tr>
                    <tr><td className="row-h">4</td><td><span className="str">APAC</span></td><td><span className="num">6,870</span></td><td><span className="num">$209</span></td><td className="active"><span className="num">$1,435,830</span></td><td><span className="pos">+22.1%</span></td></tr>
                    <tr><td className="row-h">5</td><td><span className="str">MEA</span></td><td><span className="num">1,244</span></td><td><span className="num">$199</span></td><td><span className="num">$247,556</span></td><td><span className="neg">-3.1%</span></td></tr>
                    <tr><td className="row-h">6</td><td><span className="str" style={{ color: 'var(--fg-4)' }}>Σ total</span></td><td><span className="num">34,019</span></td><td>—</td><td><span className="num pos">$7,701,031</span></td><td><span className="pos">+16.8%</span></td></tr>
                    <tr><td className="row-h">7</td><td /><td /><td /><td /><td /></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
