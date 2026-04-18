export default function Deploy() {
  return (
    <section id="deploy">
      <div className="container">
        <div className="section-head">
          <div className="kicker"><span className="n">06</span> Deploy</div>
          <div>
            <h2>Git es la fuente de verdad. No el archivo.</h2>
            <p>
              Cada cambio es un PR. Cada release es un tag. Cada rollback es un{' '}
              <code className="mono" style={{ color: 'var(--fg-2)' }}>git revert</code>. Por fin,
              tus modelos financieros dejan de vivir en{' '}
              <code className="mono" style={{ color: 'var(--fg-2)' }}>modelo_FINAL_v7_JUAN_vdef.xlsx</code>.
            </p>
          </div>
        </div>

        <div className="feature-row">
          <div className="feature-card">
            <h3>CI que entiende de celdas</h3>
            <p>Diffs por celda, no por bytes. Tests sobre fórmulas. El reviewer ve <em>qué número cambió</em> y <em>por qué</em>, no un blob binario.</p>
            <div className="visual">
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)', color: 'var(--fg-3)', fontSize: 11 }}>
                  <span>diff · sheets/forecast.sheet.tsx</span>
                  <span style={{ color: 'var(--accent)' }}>● passing</span>
                </div>
                <div style={{ padding: '12px 14px', lineHeight: 1.7 }}>
                  <div style={{ color: 'oklch(0.7 0.2 25)', background: 'oklch(0.7 0.2 25 / 0.08)', padding: '0 8px', margin: '0 -8px' }}>
                    - &lt;Cell format=&quot;currency&quot;&gt;&#123;r.rev * 1.12&#125;&lt;/Cell&gt;
                  </div>
                  <div style={{ color: 'var(--accent)', background: 'var(--accent-dim)', padding: '0 8px', margin: '0 -8px' }}>
                    + &lt;Cell format=&quot;currency&quot;&gt;&#123;r.rev * (1 + growth)&#125;&lt;/Cell&gt;
                  </div>
                  <div style={{ color: 'var(--fg-3)', marginTop: 10, fontSize: 11.5 }}>
                    D2: $2,390,393 → $2,481,124 <span style={{ color: 'var(--accent)' }}>+3.8%</span>
                  </div>
                  <div style={{ color: 'var(--fg-3)', fontSize: 11.5 }}>
                    D3: $868,946 → $901,883 <span style={{ color: 'var(--accent)' }}>+3.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-card">
            <h3>Preview deployments por PR</h3>
            <p>Cada pull request genera un .xlsx ephemeral, un Sheet descartable, y un URL compartible. Tu CFO revisa el modelo antes de que llegue a main.</p>
            <div className="visual">
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', color: 'var(--fg-3)', fontSize: 11 }}>
                  nextsheet-bot · 2s ago
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <span style={{ color: 'var(--accent)' }}>✓</span>
                    <div>
                      <div style={{ color: 'var(--fg)' }}>Preview listo para <b style={{ fontWeight: 500 }}>#pr-482</b></div>
                      <div style={{ color: 'var(--fg-3)', fontSize: 11 }}>ajuste growth rate Q3</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14, fontSize: 11.5 }}>
                    <div style={{ border: '1px solid var(--border)', padding: '8px 10px', borderRadius: 6 }}>
                      <div style={{ color: 'var(--fg-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sheets</div>
                      <div style={{ color: 'var(--accent)', marginTop: 4 }}>preview-482.goog →</div>
                    </div>
                    <div style={{ border: '1px solid var(--border)', padding: '8px 10px', borderRadius: 6 }}>
                      <div style={{ color: 'var(--fg-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>.xlsx</div>
                      <div style={{ color: 'var(--accent)', marginTop: 4 }}>forecast-482.xlsx →</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
