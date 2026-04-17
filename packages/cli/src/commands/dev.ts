import { createServer, type ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import type { Command } from 'commander'
import { log } from '../logger.js'
import { loadWorkbook } from '../loader.js'
import { renderWorkbookHTML } from '../preview/render.js'
import type { WorkbookNode } from 'nextsheet'
import { resolveBackend, backendOptions } from '../backends/resolve.js'
import type { Backend } from 'nextsheet/backends'
import { loadEnv } from '../env.js'

export function devCommand(program: Command): void {
  const cmd = program
    .command('dev <files...>')
    .description('Start a live preview server at localhost:3000.')
    .option('-p, --port <port>', 'port to listen on', '3000')
    .option('-n, --name <name>', 'workbook name', 'Workbook')
    .option(
      '--poll <ms>',
      're-fetch live backend data every N milliseconds (e.g. 5000); requires a backend flag',
    )

  for (const [flag, desc] of backendOptions) cmd.option(flag, desc)

  cmd.action(async (
    files: string[],
    opts: {
      port: string
      name: string
      poll?: string
      googleSpreadsheetId?: string
      googleAccessToken?: string
      googleCredentials?: string
      microsoftToken?: string
      driveItemId?: string
    }
  ) => {
    const port = parseInt(opts.port, 10)
    const absFiles = files.map((f) => resolve(process.cwd(), f))
    loadEnv('development')
    const backend: Backend | undefined = resolveBackend(opts)
    const pollMs = opts.poll ? parseInt(opts.poll, 10) : undefined

    if (backend) log.dim(`Using backend: ${backend.name}`)

    let currentWb: WorkbookNode | null = null
    const sseClients = new Set<ServerResponse>()

    function pushSSE(event: string, data: string): void {
      const msg = `event: ${event}\ndata: ${data}\n\n`
      for (const res of sseClients) {
        try { res.write(msg) } catch { sseClients.delete(res) }
      }
    }

    async function rebuild(): Promise<void> {
      try {
        currentWb = await loadWorkbook(files, opts.name, backend)
        log.success(`[${new Date().toLocaleTimeString()}] rebuilt`)
        pushSSE('reload', 'ok')
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        log.error(msg)
        pushSSE('error-build', msg.replace(/\n/g, ' '))
      }
    }

    const server = createServer((req, res) => {
      if (req.url === '/__nextsheet_sse') {
        res.writeHead(200, {
          'Content-Type':  'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection:      'keep-alive',
          'Access-Control-Allow-Origin': '*',
        })
        res.write(': connected\n\n')
        sseClients.add(res)
        req.on('close', () => sseClients.delete(res))
        return
      }

      if (req.url === '/' || req.url === '/index.html') {
        const html = currentWb
          ? renderWorkbookHTML(currentWb, port)
          : `<html><body style="font:14px monospace;padding:32px;background:#0f0f0f;color:#888">Building…</body></html>`
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(html)
        return
      }

      res.writeHead(404)
      res.end('Not found')
    })

    server.listen(port, () => {
      log.info(`NextSheet dev server → http://localhost:${port}`)
      log.dim(`Watching ${files.length} file(s)…  (ctrl+c to stop)`)
      if (backend && pollMs) log.dim(`Polling backend every ${pollMs}ms`)
    })

    await rebuild()

    // Open browser
    try {
      const { exec } = await import('node:child_process')
      const cmd = process.platform === 'darwin' ? 'open'
        : process.platform === 'win32' ? 'start'
        : 'xdg-open'
      exec(`${cmd} http://localhost:${port}`)
    } catch { /* non-fatal */ }

    const { default: chokidar } = await import('chokidar')
    const watcher = chokidar.watch(absFiles, { ignoreInitial: true })
    watcher.on('change', (path) => {
      log.dim(`Changed: ${path}`)
      void rebuild()
    })
    watcher.on('error', (err) => log.error(String(err)))

    // Backend polling — re-fetch live data on interval without file change
    if (backend && pollMs && pollMs > 0) {
      setInterval(() => {
        log.dim(`[poll] refreshing backend data…`)
        void rebuild()
      }, pollMs)
    }
  })
}
