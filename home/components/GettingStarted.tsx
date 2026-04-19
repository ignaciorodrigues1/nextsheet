import { getTranslations } from 'next-intl/server'

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

export default async function GettingStarted() {
  const t = await getTranslations('gettingStarted')
  const h2Html = (t.raw('h2') as string).replace('<accent>', '<span style="color:var(--accent)">').replace('</accent>', '</span>')
  const pHtml = t.raw('p') as string

  const terminalHtml = `<span class="hl-cmt">${t('terminal_comment1')}</span>
<span class="hl-gn">$</span> npx create-nextsheet-app revenue-model
<span class="hl-cmt">  ${t('terminal_ok1')}</span>
<span class="hl-cmt">  ${t('terminal_ok2')}</span>
<span class="hl-cmt">  ${t('terminal_ok3')}</span>

<span class="hl-gn">$</span> cd revenue-model && pnpm dev
<span class="hl-cmt">  ${t('terminal_ok4')}</span>
<span class="hl-cmt">  - local:    http://localhost:3000</span>
<span class="hl-cmt">  - sheet:    file://./dist/forecast.xlsx</span>
<span class="hl-cmt">  - types:    generating ./types/cells.d.ts</span>
<span class="hl-cmt">  ${t('terminal_ok5')}</span>`

  return (
    <section id="start">
      <div className="container">
        <div className="section-head">
          <div className="kicker"><span className="n">02</span> {t('kicker').replace('02 ', '')}</div>
          <div>
            <h2 dangerouslySetInnerHTML={{ __html: h2Html }} />
            <p dangerouslySetInnerHTML={{ __html: pHtml }} />
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
