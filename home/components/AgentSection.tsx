import { getTranslations } from 'next-intl/server'

const capabilities = [
  { icon: '?"', key: 'cap1' },
  { icon: '∂=', key: 'cap2' },
  { icon: '×!', key: 'cap3' },
  { icon: '◈+', key: 'cap4' },
  { icon: '≡→', key: 'cap5' },
  { icon: '⊕∘', key: 'cap6' },
] as const

export default async function AgentSection() {
  const t = await getTranslations('agentSection')
  return (
    <section id="agent">
      <div className="container">
        <div className="section-head">
          <div className="kicker"><span className="n">05</span> {t('kicker').replace('05 ', '')}</div>
          <div>
            <h2>{t('h2')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t.raw('p') as string }} />
          </div>
        </div>

        <div className="agent-layout">
          {/* Left: capability grid */}
          <div className="agent-caps">
            {capabilities.map(({ icon, key }) => (
              <div className="agent-cap" key={key}>
                <div className="agent-cap-icon mono">{icon}</div>
                <div>
                  <div className="agent-cap-title">{t(`${key}_title` as Parameters<typeof t>[0])}</div>
                  <div className="agent-cap-desc">{t(`${key}_desc` as Parameters<typeof t>[0])}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: mock agent chat */}
          <div className="agent-chat">
            <div className="agent-chat-bar">
              <div className="sb-dots">
                <i style={{ background: '#ff5f57' }} />
                <i style={{ background: '#febc2e' }} />
                <i style={{ background: '#28c840' }} />
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                nextsheet · agent · Sales.sheet.tsx
              </span>
            </div>
            <div className="agent-chat-body">
              {/* User message */}
              <div className="chat-msg chat-user">
                <span className="chat-role mono">you</span>
                <span>{t('chat_q1')}</span>
              </div>

              {/* Agent response */}
              <div className="chat-msg chat-agent">
                <span className="chat-role mono">agent</span>
                <span dangerouslySetInnerHTML={{ __html: t.raw('chat_a1') as string }} />
              </div>

              {/* Patch preview */}
              <div className="chat-patch">
                <div className="chat-patch-label mono">{t('chat_patch_label')}</div>
                <pre className="mono chat-patch-code">{`{ op: "updateCell",
  sheet: "Sales",
  rowIndex: 4,
  column: "price",
  value: 185 }

→ D5: $247,556 → $230,180
  E5: -3.1%  → -9.3%  (formula preserved)`}</pre>
              </div>

              {/* Second user message */}
              <div className="chat-msg chat-user">
                <span className="chat-role mono">you</span>
                <span>{t('chat_q2')}</span>
              </div>

              {/* Second agent response */}
              <div className="chat-msg chat-agent">
                <span className="chat-role mono">agent</span>
                <span dangerouslySetInnerHTML={{ __html: t.raw('chat_a2') as string }} />
              </div>
            </div>

            {/* Input bar */}
            <div className="agent-chat-input">
              <span className="mono" style={{ color: 'var(--fg-4)', fontSize: 12 }}>{t('chat_placeholder')}</span>
              <div className="agent-chat-send mono">⏎</div>
            </div>
          </div>
        </div>

        {/* API callout */}
        <div className="agent-api-row">
          <div className="agent-api-pill mono">
            <span style={{ color: 'var(--fg-3)' }}>import</span>{' '}
            {'{ wb, fromWorkbook, AgentError }'}{' '}
            <span style={{ color: 'var(--fg-3)' }}>from</span>{' '}
            <span style={{ color: 'var(--accent)' }}>'nextsheet/agent'</span>
          </div>
          <div className="agent-api-links">
            <a href="https://github.com/ignaciorodrigues1/nextsheet" target="_blank" rel="noopener" className="btn">
              {t('api_docs')} →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
