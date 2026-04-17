import type {
  CellNode,
  ColumnNode,
  RowNode,
  SectionNode,
  SheetNode,
  WorkbookNode,
} from 'nextsheet'

// ─── Cell value formatting ────────────────────────────────────────────────────

function formatValue(cell: CellNode, col?: ColumnNode): string {
  const value = cell.value
  if (value === null || value === undefined || value === '') return ''

  const fmt = cell.format ?? col?.type

  if (fmt === 'currency' || col?.type === 'currency') {
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    if (isNaN(num)) return String(value)
    const currency = col?.currency ?? 'USD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(num)
  }

  if (fmt === 'percent' || col?.type === 'percent') {
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    if (isNaN(num)) return String(value)
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
    }).format(num)
  }

  if (fmt === 'number' || col?.type === 'number') {
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    if (isNaN(num)) return String(value)
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (col?.type === 'boolean') {
    if (value === true  || value === 'true'  || value === 1) return '✓'
    if (value === false || value === 'false' || value === 0) return '✗'
  }

  return String(value)
}

// ─── Cell inline styles ───────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  red:    '#ef4444',
  green:  '#22c55e',
  blue:   '#3b82f6',
  yellow: '#eab308',
  orange: '#f97316',
  purple: '#a855f7',
  gray:   '#6b7280',
}

function cellStyle(cell: CellNode, col?: ColumnNode): string {
  const styles: string[] = []

  if (cell.bold === true) styles.push('font-weight:600')

  const color = cell.color
  if (color !== undefined) {
    styles.push(`color:${COLOR_MAP[color] ?? color}`)
  }

  const fmt = cell.format ?? col?.type
  if (fmt === 'currency' || fmt === 'number' || fmt === 'percent') {
    styles.push('text-align:right; font-variant-numeric:tabular-nums')
  }

  return styles.join(';')
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── Sheet → HTML table ───────────────────────────────────────────────────────

function renderCell(
  cell: CellNode,
  col: ColumnNode | undefined,
  tag: 'td' | 'th',
  extraClass = ''
): string {
  const style  = cellStyle(cell, col)
  const value  = cell.formula !== undefined
    ? `<span class="formula" title="formula: ${escapeHTML(cell.formula)}">=${escapeHTML(cell.formula)}</span>`
    : escapeHTML(formatValue(cell, col))
  const colspan = cell.colspan !== undefined && cell.colspan > 1
    ? ` colspan="${cell.colspan}"`
    : ''
  const cls = [tag === 'th' ? 'th' : 'td', extraClass].filter(Boolean).join(' ')
  const styleAttr = style ? ` style="${style}"` : ''
  return `<${tag} class="${cls}"${colspan}${styleAttr}>${value}</${tag}>`
}

function renderRow(row: RowNode, columns: ColumnNode[], colCount: number): string {
  const tag = row.header === true ? 'th' : 'td'
  const cls = row.header === true ? 'row-header' : ''
  const cells = row.cells.map((cell, i) => renderCell(cell, columns[i], tag === 'th' ? 'th' : 'td', cls))
  // Pad to column count so the grid stays aligned
  while (cells.length < colCount) cells.push('<td class="td"></td>')
  return `<tr>${cells.join('')}</tr>`
}

function renderSection(section: SectionNode, columns: ColumnNode[], colCount: number): string {
  const rows: string[] = []
  if (section.title !== undefined) {
    rows.push(
      `<tr><td class="section-title" colspan="${Math.max(colCount, 1)}">${escapeHTML(section.title)}</td></tr>`
    )
  }
  for (const row of section.rows) {
    rows.push(renderRow(row, columns, colCount))
  }
  return rows.join('\n')
}

function renderSheet(sheet: SheetNode): string {
  const rows: string[] = []
  const columns = sheet.columns
  const colCount = Math.max(
    columns.length,
    ...sheet.sections.flatMap((s) => s.rows.map((r) => r.cells.length)),
    ...sheet.rows.map((r) => r.cells.length),
    1
  )

  // Header block
  if (sheet.header !== undefined) {
    rows.push(`
      <tr>
        <td class="sheet-header-title" colspan="${colCount}">${escapeHTML(sheet.header.title)}</td>
      </tr>`)
    if (sheet.header.subtitle !== undefined) {
      rows.push(`
      <tr>
        <td class="sheet-header-subtitle" colspan="${colCount}">${escapeHTML(sheet.header.subtitle)}</td>
      </tr>`)
    }
    rows.push(`<tr><td class="spacer" colspan="${colCount}"></td></tr>`)
  }

  // Column header row (schema mode)
  if (columns.length > 0) {
    const headers = columns.map((col) => `<th class="th col-header">${escapeHTML(col.name)}</th>`)
    while (headers.length < colCount) headers.push('<th class="th"></th>')
    rows.push(`<tr>${headers.join('')}</tr>`)
  }

  // Sections
  for (const section of sheet.sections) {
    rows.push(renderSection(section, columns, colCount))
  }

  // Direct rows
  for (const row of sheet.rows) {
    rows.push(renderRow(row, columns, colCount))
  }

  return `<table class="sheet-table"><tbody>${rows.join('\n')}</tbody></table>`
}

// ─── Full page HTML ───────────────────────────────────────────────────────────

export function renderWorkbookHTML(wb: WorkbookNode, port: number): string {
  const sheets = wb.sheets

  const tabs = sheets
    .map((s, i) =>
      `<button class="tab${i === 0 ? ' active' : ''}" data-idx="${i}" onclick="selectTab(${i})">${escapeHTML(s.name)}</button>`
    )
    .join('')

  const panels = sheets
    .map((s, i) =>
      `<div class="panel${i === 0 ? ' active' : ''}" id="panel-${i}">${renderSheet(s)}</div>`
    )
    .join('')

  const buildTime = new Date().toLocaleTimeString()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(wb.name)} — NextSheet dev</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #0f0f0f;
      --surface:   #1a1a1a;
      --border:    #2a2a2a;
      --muted:     #555;
      --text:      #e8e8e8;
      --text-dim:  #888;
      --accent:    #fff;
      --tab-bg:    #141414;
      --tab-active:#1f1f1f;
      --header-bg: #161616;
      --row-hover: #1e1e1e;
      --th-bg:     #1c1c1c;
      --section-bg:#161616;
      --formula:   #7c9fff;
      --radius:    6px;
      --font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace;
      --font-ui:   -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    @media (prefers-color-scheme: light) {
      :root {
        --bg:        #f5f5f5;
        --surface:   #ffffff;
        --border:    #e0e0e0;
        --muted:     #bbb;
        --text:      #111;
        --text-dim:  #666;
        --accent:    #000;
        --tab-bg:    #ebebeb;
        --tab-active:#ffffff;
        --header-bg: #f0f0f0;
        --row-hover: #f9f9f9;
        --th-bg:     #f0f0f0;
        --section-bg:#fafafa;
        --formula:   #2563eb;
      }
    }

    html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-ui); }

    /* ── Top bar ─────────────────────────────────────────────────── */
    .topbar {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 48px;
      padding: 0 20px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .topbar-logo {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: var(--accent);
    }
    .topbar-sep { color: var(--muted); font-size: 16px; }
    .topbar-name {
      font-size: 13px;
      color: var(--text);
      font-weight: 500;
    }
    .topbar-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .build-time {
      font-size: 11px;
      color: var(--text-dim);
      font-family: var(--font-mono);
    }
    .dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    .dot.error { background: #ef4444; animation: none; }

    /* ── Tabs ────────────────────────────────────────────────────── */
    .tabs {
      display: flex;
      gap: 2px;
      padding: 8px 16px 0;
      background: var(--tab-bg);
      border-bottom: 1px solid var(--border);
    }
    .tab {
      padding: 6px 14px;
      font-size: 12px;
      font-family: var(--font-ui);
      cursor: pointer;
      background: transparent;
      border: 1px solid transparent;
      border-bottom: none;
      border-radius: var(--radius) var(--radius) 0 0;
      color: var(--text-dim);
      transition: background 0.1s, color 0.1s;
    }
    .tab:hover { background: var(--surface); color: var(--text); }
    .tab.active {
      background: var(--tab-active);
      border-color: var(--border);
      border-bottom-color: var(--tab-active);
      color: var(--text);
      margin-bottom: -1px;
    }

    /* ── Panels ──────────────────────────────────────────────────── */
    .panels { overflow: auto; padding: 24px; }
    .panel { display: none; }
    .panel.active { display: block; }

    /* ── Spreadsheet table ───────────────────────────────────────── */
    .sheet-table {
      border-collapse: collapse;
      width: 100%;
      font-size: 13px;
      font-family: var(--font-mono);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .th, .td {
      padding: 6px 12px;
      border: 1px solid var(--border);
      white-space: nowrap;
      min-width: 80px;
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }

    .th {
      background: var(--th-bg);
      font-weight: 600;
      font-size: 12px;
      color: var(--text);
    }

    .col-header {
      background: var(--header-bg);
      color: var(--text-dim);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      position: sticky;
      top: 49px; /* below topbar */
    }

    .td { color: var(--text); }
    tr:hover .td { background: var(--row-hover); }

    .row-header.th {
      background: var(--th-bg);
    }

    .sheet-header-title {
      font-size: 18px;
      font-weight: 700;
      font-family: var(--font-ui);
      padding: 16px 12px 4px;
      border: none;
      border-bottom: 1px solid var(--border);
      color: var(--text);
      letter-spacing: -0.02em;
    }

    .sheet-header-subtitle {
      font-size: 12px;
      color: var(--text-dim);
      font-family: var(--font-ui);
      padding: 2px 12px 12px;
      border: none;
    }

    .spacer { height: 4px; border: none; }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-dim);
      background: var(--section-bg);
      padding: 10px 12px 4px;
      border: none;
      border-top: 1px solid var(--border);
      font-family: var(--font-ui);
    }

    .formula {
      color: var(--formula);
      font-style: italic;
      font-size: 11px;
    }

    /* ── Empty state ─────────────────────────────────────────────── */
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 300px;
      color: var(--text-dim);
      font-size: 13px;
    }

    /* ── Error toast ─────────────────────────────────────────────── */
    #error-bar {
      display: none;
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: #ef4444;
      color: #fff;
      font-size: 12px;
      font-family: var(--font-mono);
      padding: 10px 20px;
      border-radius: var(--radius);
      max-width: 90vw;
      text-align: center;
      z-index: 99;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <span class="topbar-logo">NextSheet</span>
    <span class="topbar-sep">/</span>
    <span class="topbar-name">${escapeHTML(wb.name)}</span>
    <div class="topbar-right">
      <span class="build-time" id="build-time">Built at ${buildTime}</span>
      <span class="dot" id="dot" title="Watching for changes"></span>
    </div>
  </div>

  ${sheets.length > 1 ? `<div class="tabs">${tabs}</div>` : ''}

  <div class="panels">
    ${sheets.length > 0 ? panels : '<div class="empty">No sheets to preview. Add a <code>.sheet.tsx</code> file.</div>'}
  </div>

  <div id="error-bar"></div>

  <script>
    function selectTab(idx) {
      document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === idx))
      document.querySelectorAll('.panel').forEach((p, i) => p.classList.toggle('active', i === idx))
    }

    // ── SSE hot-reload ──────────────────────────────────────────────
    const dot      = document.getElementById('dot')
    const buildEl  = document.getElementById('build-time')
    const errorBar = document.getElementById('error-bar')

    function connect() {
      const es = new EventSource('/__nextsheet_sse')

      es.addEventListener('reload', () => location.reload())

      es.addEventListener('error-build', (e) => {
        errorBar.textContent = e.data
        errorBar.style.display = 'block'
        dot.classList.add('error')
        dot.title = 'Build error'
      })

      es.onopen = () => {
        dot.classList.remove('error')
        dot.title = 'Watching for changes'
        errorBar.style.display = 'none'
      }

      es.onerror = () => {
        // Server restarted or network issue — retry after 1s
        es.close()
        setTimeout(connect, 1000)
      }
    }

    connect()
  </script>
</body>
</html>`
}
