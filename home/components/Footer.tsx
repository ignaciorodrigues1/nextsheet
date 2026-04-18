export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="top">
          <div className="brand-col">
            <div className="logo">
              <span className="mark" />
              <span className="brand">NextSheet</span>
            </div>
            <p>El framework open-source para la era de la hoja de cálculo. MIT. Construido en público.</p>
          </div>
          <div>
            <h5>Producto</h5>
            <ul>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet" target="_blank" rel="noopener">Docs</a></li>
              <li><a href="https://www.npmjs.com/package/nextsheet-cli" target="_blank" rel="noopener">CLI</a></li>
              <li><a href="https://www.npmjs.com/package/nextsheet" target="_blank" rel="noopener">npm</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/releases" target="_blank" rel="noopener">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h5>Recursos</h5>
            <ul>
              <li><a href="#thesis">Tesis</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet" target="_blank" rel="noopener">RFCs</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/tree/main/examples" target="_blank" rel="noopener">Ejemplos</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/blob/main/README.md" target="_blank" rel="noopener">README</a></li>
            </ul>
          </div>
          <div>
            <h5>Comunidad</h5>
            <ul>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet" target="_blank" rel="noopener">GitHub</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/discussions" target="_blank" rel="noopener">Discussions</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/issues" target="_blank" rel="noopener">Issues</a></li>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">Contribuir</a></li>
            </ul>
          </div>
          <div>
            <h5>Legal</h5>
            <ul>
              <li><a href="https://github.com/ignaciorodrigues1/nextsheet/blob/main/LICENSE" target="_blank" rel="noopener">Licencia MIT</a></li>
              <li><a href="#">Privacidad</a></li>
              <li><a href="#">Marca</a></li>
            </ul>
          </div>
        </div>
        <div className="bottom">
          <div className="mono">© 2026 NextSheet · v0.4.0 · MIT</div>
          <div className="mono" style={{ color: 'var(--fg-4)' }}>build: 761d498 · shipped from Buenos Aires</div>
        </div>
      </div>
    </footer>
  )
}
