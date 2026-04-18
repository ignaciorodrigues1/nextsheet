import type {
  CellNode,
  ChartNode,
  ColumnNode,
  PaginateNode,
  RowNode,
  SectionNode,
  SheetNode,
  WorkbookNode,
} from 'nextsheet'
import { getActiveConfig } from 'nextsheet'

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

function renderRow(row: RowNode, columns: ColumnNode[], colCount: number, rowIdx?: number): string {
  const tag = row.header === true ? 'th' : 'td'
  const cls = row.header === true ? 'row-header' : ''
  const cells = row.cells.map((cell, i) => renderCell(cell, columns[i], tag === 'th' ? 'th' : 'td', cls))
  while (cells.length < colCount) cells.push('<td class="td"></td>')
  const dataAttr = rowIdx !== undefined && row.header !== true ? ` data-nxt-row="${rowIdx}"` : ''
  return `<tr${dataAttr}>${cells.join('')}</tr>`
}

function renderSection(
  section: SectionNode,
  columns: ColumnNode[],
  colCount: number,
  startRowIdx: number,
  paginated: boolean,
): { html: string; rowCount: number } {
  const rows: string[] = []
  let dataRowCount = 0

  if (section.title !== undefined) {
    const sectionAttr = paginated ? ` data-nxt-section-start="${startRowIdx}"` : ''
    rows.push(
      `<tr${sectionAttr}><td class="section-title" colspan="${Math.max(colCount, 1)}">${escapeHTML(section.title)}</td></tr>`
    )
  }

  for (const row of section.rows) {
    const idx = row.header === true ? undefined : (paginated ? startRowIdx + dataRowCount : undefined)
    rows.push(renderRow(row, columns, colCount, idx))
    if (row.header !== true) dataRowCount++
  }

  return { html: rows.join('\n'), rowCount: dataRowCount }
}

// ─── Chart rendering ──────────────────────────────────────────────────────────

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f97316',
  '#a855f7', '#eab308', '#06b6d4', '#ec4899',
  '#14b8a6', '#f43f5e',
]

function getAllDataRows(sheet: SheetNode): RowNode[] {
  const out: RowNode[] = []
  for (const section of sheet.sections) {
    for (const r of section.rows) if (r.header !== true) out.push(r)
  }
  for (const r of sheet.rows) if (r.header !== true) out.push(r)
  return out
}

function resolveChartjsType(type: ChartNode['type']): string {
  switch (type) {
    case 'donut':        return 'doughnut'
    case 'stacked-bar':  return 'bar'
    case 'stacked-area': return 'line'
    case 'horizontal-bar': return 'bar'
    case 'area':         return 'line'
    default:             return type
  }
}

function renderChart(chart: ChartNode, sheet: SheetNode, sheetIdx: number, chartIdx: number): string {
  const canvasId = `chart-${sheetIdx}-${chartIdx}`
  const dataRows = getAllDataRows(sheet)
  const type = chart.type

  const isCircular = type === 'pie' || type === 'donut'
  const isArea     = type === 'area' || type === 'stacked-area'
  const isStacked  = type === 'stacked-bar' || type === 'stacked-area'
  const isHoriz    = type === 'horizontal-bar'
  const isScatter  = type === 'scatter'
  const isBubble   = type === 'bubble'
  const isRadar    = type === 'radar'
  const isLine     = type === 'line' || isArea

  // Resolve x-axis labels
  let labels: string[]
  if (chart.xAxis !== undefined) {
    const xIdx = sheet.columns.findIndex((c) => c.name === chart.xAxis)
    labels = xIdx >= 0
      ? dataRows.map((r) => String(r.cells[xIdx]?.value ?? ''))
      : dataRows.map((_, i) => String(i + 1))
  } else {
    labels = dataRows.map((_, i) => String(i + 1))
  }

  const chartjsType = resolveChartjsType(type)

  // Build datasets
  const datasets = chart.series.map((series, i) => {
    const color = series.color ?? CHART_COLORS[i % CHART_COLORS.length] ?? '#3b82f6'
    let data: unknown[]

    if (series.points !== undefined) {
      // Explicit {x,y,r} points (scatter / bubble)
      data = [...series.points]
    } else {
      // Extract numeric values from column ref or inline data array
      let values: number[]
      if (series.column !== undefined) {
        const colIdx = sheet.columns.findIndex((c) => c.name === series.column)
        values = colIdx >= 0
          ? dataRows.map((r) => {
              const v = r.cells[colIdx]?.value
              return typeof v === 'number' ? v : parseFloat(String(v ?? 0)) || 0
            })
          : dataRows.map(() => 0)
      } else {
        values = series.data ? [...series.data] : []
      }

      if (isScatter) {
        data = values.map((y, x) => ({ x, y }))
      } else if (isBubble) {
        data = values.map((y, x) => ({ x, y, r: 6 }))
      } else {
        data = values
      }
    }

    // Background & border colors
    const bgColor   = isCircular
      ? CHART_COLORS.map((c) => c + 'cc')
      : isLine ? color + '33' : color + 'cc'
    const borderCol = isCircular ? CHART_COLORS : color

    const ds: Record<string, unknown> = {
      label: series.name,
      data,
      backgroundColor: bgColor,
      borderColor: borderCol,
      borderWidth: isCircular ? 1 : 2,
    }

    if (isLine) {
      ds.fill    = isArea
      ds.tension = 0.3
    }
    if (isScatter || isBubble) ds.pointRadius = 5
    else if (isLine)           ds.pointRadius = 3

    return JSON.stringify(ds)
  })

  // Scales config — omitted for circular + radar (Chart.js handles them natively)
  const gridColor = 'rgba(128,128,128,0.15)'
  let scalesStr: string
  if (isCircular || isRadar) {
    scalesStr = 'undefined'
  } else {
    scalesStr = JSON.stringify({
      x: { stacked: isStacked, grid: { color: gridColor } },
      y: { stacked: isStacked, grid: { color: gridColor } },
    })
  }

  const height = chart.height ?? 320
  const widthStyle = chart.width != null && chart.width > 0
    ? `max-width:${chart.width}px;` : ''

  const titleCfg = chart.title !== undefined
    ? `title:{display:true,text:${JSON.stringify(chart.title)},font:{size:14}},` : ''

  const showLegend = chart.showLegend !== false

  return `
<div class="chart-wrap">
  <canvas id="${canvasId}" style="${widthStyle}height:${height}px"></canvas>
</div>
<script>
(function(){
  var ctx = document.getElementById(${JSON.stringify(canvasId)});
  if (!ctx || !window.Chart) return;
  new Chart(ctx, {
    type: ${JSON.stringify(chartjsType)},
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [${datasets.join(',')}]
    },
    options: {
      indexAxis: ${isHoriz ? "'y'" : "'x'"},
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ${titleCfg}
        legend: {
          display: ${showLegend},
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 11 } }
        }
      },
      scales: ${scalesStr}
    }
  });
})();
</script>`
}

function renderPaginator(sheetIdx: number, pagination: PaginateNode, totalRows: number): string {
  const { pageSize, initialPage = 1 } = pagination
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const id = `pager-${sheetIdx}`
  return `
<div class="paginator" id="${id}" data-sheet="${sheetIdx}" data-page-size="${pageSize}" data-total-rows="${totalRows}" data-current-page="${initialPage}">
  <button class="pager-btn" id="${id}-prev" onclick="nxtPagerPrev(${sheetIdx})" aria-label="Previous page">&#8592; Prev</button>
  <span class="pager-info" id="${id}-info">Page ${initialPage} of ${totalPages}</span>
  <button class="pager-btn" id="${id}-next" onclick="nxtPagerNext(${sheetIdx})" aria-label="Next page">Next &#8594;</button>
  <span class="pager-count" id="${id}-count">${totalRows.toLocaleString()} rows</span>
</div>`
}

function renderSheet(sheet: SheetNode, sheetIdx = 0): string {
  const rows: string[] = []
  const columns = sheet.columns
  const paginated = sheet.pagination !== undefined
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

  // Sections — track running row index for pagination
  let dataRowIdx = 0
  for (const section of sheet.sections) {
    const { html, rowCount } = renderSection(section, columns, colCount, dataRowIdx, paginated)
    rows.push(html)
    dataRowIdx += rowCount
  }

  // Direct rows
  for (const row of sheet.rows) {
    const idx = row.header !== true && paginated ? dataRowIdx : undefined
    rows.push(renderRow(row, columns, colCount, idx))
    if (row.header !== true) dataRowIdx++
  }

  const totalRows = dataRowIdx
  const tableId = `table-${sheetIdx}`
  const table = `<table class="sheet-table" id="${tableId}"><tbody>${rows.join('\n')}</tbody></table>`

  // Paginator controls
  const paginatorHtml = paginated && sheet.pagination !== undefined
    ? renderPaginator(sheetIdx, sheet.pagination, totalRows)
    : ''

  // Charts
  const charts = sheet.charts
    .map((chart, chartIdx) => renderChart(chart, sheet, sheetIdx, chartIdx))
    .join('\n')

  const parts = [table, paginatorHtml, charts].filter(Boolean)
  return parts.join('\n')
}

// ─── Theme CSS injection ──────────────────────────────────────────────────────

function themeOverrideCSS(): string {
  const { theme } = getActiveConfig()
  if (theme === undefined) return ''

  const vars: string[] = []
  const { colors, typography } = theme

  if (colors?.background !== undefined) vars.push(`--bg: ${colors.background}`)
  if (colors?.text !== undefined)       vars.push(`--text: ${colors.text}`, `--accent: ${colors.text}`)
  if (colors?.border !== undefined)     vars.push(`--border: ${colors.border}`)
  if (colors?.muted !== undefined)      vars.push(`--muted: ${colors.muted}`)
  if (colors?.primary !== undefined) {
    vars.push(
      `--th-bg: ${colors.primary}`,
      `--header-bg: ${colors.primary}`,
      `--col-header-text: ${colors.headerText ?? '#fff'}`,
    )
  }
  if (typography?.fontFamily !== undefined) {
    vars.push(`--font-ui: "${typography.fontFamily}", system-ui, sans-serif`)
  }
  if (typography?.fontSize !== undefined) {
    vars.push(`--font-size: ${typography.fontSize}px`)
  }

  if (vars.length === 0) return ''
  return `\n  <style>\n    :root {\n      ${vars.join(';\n      ')};\n    }\n  </style>`
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
      `<div class="panel${i === 0 ? ' active' : ''}" id="panel-${i}">${renderSheet(s, i)}</div>`
    )
    .join('')

  const buildTime = new Date().toLocaleTimeString()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(wb.name)} — NextSheet dev</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>${themeOverrideCSS()}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --font-size: 13px;
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
      --formula:          #7c9fff;
      --radius:           6px;
      --font-mono:        'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace;
      --font-ui:          -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --col-header-text:  var(--text-dim);
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
      font-size: var(--font-size);
      font-family: var(--font-ui);
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
      color: var(--col-header-text);
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

    /* ── Charts ──────────────────────────────────────────────────── */
    .chart-wrap {
      margin-top: 24px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      position: relative;
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

    /* ── Paginator ───────────────────────────────────────────────── */
    .paginator {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
      padding: 8px 4px;
      font-size: 12px;
      font-family: var(--font-ui);
      color: var(--text-dim);
    }
    .pager-btn {
      padding: 5px 14px;
      font-size: 12px;
      font-family: var(--font-ui);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text);
      cursor: pointer;
      transition: background 0.1s, border-color 0.1s;
    }
    .pager-btn:hover:not(:disabled) {
      background: var(--th-bg);
      border-color: var(--muted);
    }
    .pager-btn:disabled {
      opacity: 0.35;
      cursor: default;
    }
    .pager-info {
      font-weight: 600;
      color: var(--text);
      min-width: 90px;
      text-align: center;
    }
    .pager-count {
      margin-left: auto;
      color: var(--text-dim);
      font-size: 11px;
      font-family: var(--font-mono);
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
    // ── Pagination ──────────────────────────────────────────────────
    function nxtApplyPage(sheetIdx, page) {
      var id = 'pager-' + sheetIdx
      var pager = document.getElementById(id)
      if (!pager) return

      var pageSize  = parseInt(pager.dataset.pageSize, 10)
      var totalRows = parseInt(pager.dataset.totalRows, 10)
      var totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
      page = Math.max(1, Math.min(page, totalPages))
      pager.dataset.currentPage = String(page)

      var start = (page - 1) * pageSize
      var end   = start + pageSize

      // Show/hide data rows
      var panel = document.getElementById('panel-' + sheetIdx)
      if (!panel) return

      panel.querySelectorAll('tr[data-nxt-row]').forEach(function(tr) {
        var idx = parseInt(tr.dataset.nxtRow, 10)
        tr.style.display = (idx >= start && idx < end) ? '' : 'none'
      })

      // Show/hide section titles: visible if any row in the section is visible
      panel.querySelectorAll('tr[data-nxt-section-start]').forEach(function(tr) {
        var secStart = parseInt(tr.dataset.nxtSectionStart, 10)
        // Find next section-start index
        var allSections = Array.from(panel.querySelectorAll('tr[data-nxt-section-start]'))
        var myIdx = allSections.indexOf(tr)
        var nextSec = allSections[myIdx + 1]
        var secEnd = nextSec ? parseInt(nextSec.dataset.nxtSectionStart, 10) : totalRows
        var sectionVisible = (secStart < end) && (secEnd > start)
        tr.style.display = sectionVisible ? '' : 'none'
      })

      // Update controls
      document.getElementById(id + '-info').textContent = 'Page ' + page + ' of ' + totalPages
      document.getElementById(id + '-prev').disabled = page <= 1
      document.getElementById(id + '-next').disabled = page >= totalPages
    }

    function nxtPagerPrev(sheetIdx) {
      var pager = document.getElementById('pager-' + sheetIdx)
      if (!pager) return
      nxtApplyPage(sheetIdx, parseInt(pager.dataset.currentPage, 10) - 1)
    }

    function nxtPagerNext(sheetIdx) {
      var pager = document.getElementById('pager-' + sheetIdx)
      if (!pager) return
      nxtApplyPage(sheetIdx, parseInt(pager.dataset.currentPage, 10) + 1)
    }

    // Initialize all paginators on load
    ;(function() {
      document.querySelectorAll('.paginator').forEach(function(pager) {
        var sheetIdx = parseInt(pager.dataset.sheet, 10)
        var initialPage = parseInt(pager.dataset.currentPage, 10)
        nxtApplyPage(sheetIdx, initialPage)
      })
    })()
  </script>

  <script>
    // ── Tab navigation with localStorage persistence ────────────────
    var LS_KEY = 'nextsheet:tab:${escapeHTML(wb.name)}'

    function selectTab(idx) {
      document.querySelectorAll('.tab').forEach(function(t, i) { t.classList.toggle('active', i === idx) })
      document.querySelectorAll('.panel').forEach(function(p, i) { p.classList.toggle('active', i === idx) })
      try { localStorage.setItem(LS_KEY, String(idx)) } catch(e) {}
    }

    // Restore last active tab on load
    ;(function() {
      try {
        var saved = parseInt(localStorage.getItem(LS_KEY) || '0', 10)
        var count = document.querySelectorAll('.tab').length
        if (!isNaN(saved) && saved >= 0 && saved < count) selectTab(saved)
      } catch(e) {}
    })()

    // ── SSE hot-reload ──────────────────────────────────────────────
    var dot      = document.getElementById('dot')
    var buildEl  = document.getElementById('build-time')
    var errorBar = document.getElementById('error-bar')

    function connect() {
      var es = new EventSource('/__nextsheet_sse')

      es.addEventListener('reload', function() { location.reload() })

      es.addEventListener('error-build', function(e) {
        errorBar.textContent = e.data
        errorBar.style.display = 'block'
        dot.classList.add('error')
        dot.title = 'Build error'
      })

      es.onopen = function() {
        dot.classList.remove('error')
        dot.title = 'Watching for changes'
        errorBar.style.display = 'none'
      }

      es.onerror = function() {
        es.close()
        setTimeout(connect, 1000)
      }
    }

    connect()
  </script>
</body>
</html>`
}
