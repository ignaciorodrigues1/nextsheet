export default function Charts() {
  return (
    <section id="charts">
      <div className="container">
        <div className="section-head">
          <div className="kicker"><span className="n">05</span> Charts</div>
          <div>
            <h2>Los gráficos son componentes, no capturas.</h2>
            <p>
              Un <code className="mono" style={{ color: 'var(--fg-2)' }}>&lt;Chart/&gt;</code> de NextSheet
              se emite como chart nativo de la superficie target: editable en Sheets, interactivo en Excel,
              SVG en el browser. <strong>Mismo componente, cinco destinos.</strong>
            </p>
          </div>
        </div>

        <div className="charts">
          {/* Area */}
          <div className="chart-card">
            <div className="cn">
              <span>&lt;Chart type=&quot;area&quot; /&gt;</span>
              <b>live</b>
            </div>
            <div className="cval">$7.70M <span className="delta">+16.8% YoY</span></div>
            <svg viewBox="0 0 300 110" preserveAspectRatio="none">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="oklch(0.84 0.18 142)" stopOpacity="0.35" />
                  <stop offset="1" stopColor="oklch(0.84 0.18 142)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,88 L25,78 L50,82 L75,64 L100,70 L125,52 L150,58 L175,40 L200,46 L225,28 L250,34 L275,18 L300,22 L300,110 L0,110 Z" fill="url(#g1)" />
              <path d="M0,88 L25,78 L50,82 L75,64 L100,70 L125,52 L150,58 L175,40 L200,46 L225,28 L250,34 L275,18 L300,22" fill="none" stroke="oklch(0.84 0.18 142)" strokeWidth="1.5" />
              <line x1="0" y1="88" x2="300" y2="88" stroke="#222" strokeDasharray="2 3" />
            </svg>
          </div>

          {/* Bars */}
          <div className="chart-card">
            <div className="cn">
              <span>&lt;Chart type=&quot;bar&quot; /&gt;</span>
              <b>q3</b>
            </div>
            <div className="cval">34,019 <span className="delta" style={{ color: 'var(--fg-3)' }}>unidades · 5 regiones</span></div>
            <svg viewBox="0 0 300 110">
              <rect x="10"  y="28" width="42" height="70" fill="oklch(0.84 0.18 142)" />
              <rect x="62"  y="44" width="42" height="54" fill="oklch(0.84 0.18 142 / 0.75)" />
              <rect x="114" y="70" width="42" height="28" fill="oklch(0.84 0.18 142 / 0.5)" />
              <rect x="166" y="56" width="42" height="42" fill="oklch(0.84 0.18 142 / 0.65)" />
              <rect x="218" y="82" width="42" height="16" fill="oklch(0.84 0.18 142 / 0.4)" />
              <g fontFamily="JetBrains Mono" fontSize="8" fill="#6b6b6b" textAnchor="middle">
                <text x="31"  y="108">NA</text>
                <text x="83"  y="108">EU</text>
                <text x="135" y="108">LA</text>
                <text x="187" y="108">AP</text>
                <text x="239" y="108">ME</text>
              </g>
            </svg>
          </div>

          {/* Sparklines */}
          <div className="chart-card">
            <div className="cn">
              <span>&lt;Chart type=&quot;line&quot; /&gt;</span>
              <b>12w</b>
            </div>
            <div className="cval">+22.1% <span className="delta">APAC growth</span></div>
            <svg viewBox="0 0 300 110">
              <g stroke="oklch(0.84 0.18 142)" strokeWidth="1.2" fill="none">
                <polyline points="0,70 20,66 40,58 60,62 80,48 100,52 120,40 140,44 160,30 180,36 200,22 220,26 240,16 260,18 280,8 300,12" />
              </g>
              <g stroke="#2a2a2a" strokeWidth="1" fill="none">
                <polyline points="0,88 20,86 40,82 60,86 80,80 100,78 120,82 140,74 160,78 180,70 200,74 220,66 240,70 260,60 280,64 300,56" />
              </g>
              <g fontFamily="JetBrains Mono" fontSize="8" fill="#6b6b6b">
                <text x="0" y="104">W1</text>
                <text x="268" y="104">W12</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
