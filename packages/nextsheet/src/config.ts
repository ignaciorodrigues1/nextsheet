// Global config state — uses globalThis so it's shared across module instances
// (CLI imports nextsheet directly; transpiled sheet files bundle it inline).

interface ConfigCtx {
  config: NextSheetConfig
}

function ctx(): ConfigCtx {
  const g = globalThis as Record<string, unknown>
  if (g['__nxt_config'] === undefined) {
    g['__nxt_config'] = { config: {} } satisfies ConfigCtx
  }
  return g['__nxt_config'] as ConfigCtx
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface NextSheetColors {
  /** Header row background and chart accent. Hex string, e.g. "#3b82f6". */
  primary?: string
  /** Page background (HTML preview). */
  background?: string
  /** Default cell text color. */
  text?: string
  /** Text on primary-colored header rows. */
  headerText?: string
  /** Table / cell border color. */
  border?: string
  /** Dim labels, subtitles, metadata. */
  muted?: string
}

export interface NextSheetTypography {
  /** Font family for cell content (e.g. "Inter", "Roboto Mono"). */
  fontFamily?: string
  /** Base font size in points (xlsx) or pixels (HTML preview). */
  fontSize?: number
  /** Sheet title font size. */
  headerFontSize?: number
}

export interface NextSheetSheet {
  /** Default column width (xlsx: characters, HTML preview: rem-equivalent). */
  columnWidth?: number
}

export interface NextSheetTheme {
  colors?: NextSheetColors
  typography?: NextSheetTypography
  sheet?: NextSheetSheet
}

export interface NextSheetConfig {
  theme?: NextSheetTheme
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Type-safe config helper — identical to passing the object directly. */
export function defineConfig(config: NextSheetConfig): NextSheetConfig {
  return config
}

/** Called by the CLI after loading nextsheet.config.ts. */
export function setActiveConfig(config: NextSheetConfig): void {
  ctx().config = config
}

/** Called by adapters and the preview renderer to read the active theme. */
export function getActiveConfig(): NextSheetConfig {
  return ctx().config
}
