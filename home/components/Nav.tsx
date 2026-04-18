'use client'
import { useState } from 'react'

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="top">
      <div className="container row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#" className="logo">
            <span className="mark" />
            <span className="brand">NextSheet <em>v0.4.0</em></span>
          </a>
          <ul className="nav-links">
            <li><a href="#start">Get started</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#roadmap">Roadmap</a></li>
          </ul>
        </div>
        <div className="actions">
          <a className="btn desk-only" href="https://github.com/ignaciorodrigues1/nextsheet" target="_blank" rel="noopener">
            GitHub
          </a>
          <a className="btn desk-only" href="https://www.npmjs.com/package/nextsheet" target="_blank" rel="noopener">
            npm
          </a>
          <a className="btn primary" href="#start">
            <span className="mono">$ npm i nextsheet</span>
          </a>
          <button
            className={`nav-toggle${open ? ' on' : ''}`}
            id="navToggle"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className={`mobile-menu${open ? ' open' : ''}`}>
        <a href="#start" onClick={() => setOpen(false)}>Get started</a>
        <a href="#how" onClick={() => setOpen(false)}>How it works</a>
        <a href="#roadmap" onClick={() => setOpen(false)}>Roadmap</a>
        <a href="https://github.com/ignaciorodrigues1/nextsheet" target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.npmjs.com/package/nextsheet" target="_blank" rel="noopener">npm</a>
      </div>
    </nav>
  )
}
