// ─── Enterprise types ──────────────────────────────────────────────────────────
// Types for RBAC, audit logging, data connectors, scheduling, and versioning.
// These model the surface area needed to run NextSheet at enterprise scale.

// ─── RBAC ─────────────────────────────────────────────────────────────────────

/** A named role granted to users or service accounts. */
export interface Role {
  readonly id: string
  readonly name: string
  readonly description?: string
}

/** Actions a principal can perform on a workbook or sheet. */
export type Permission =
  | 'workbook:view'
  | 'workbook:build'
  | 'workbook:deploy'
  | 'workbook:admin'
  | 'sheet:view'
  | 'sheet:edit'
  | 'sheet:export'
  | 'backend:read'
  | 'backend:write'

/** Binds a principal (user or service account) to a set of roles. */
export interface RoleBinding {
  readonly principalId: string
  readonly principalType: 'user' | 'service-account' | 'group'
  readonly roles: readonly string[]
  readonly workbookId?: string
  /** ISO 8601 expiry timestamp. Binding is ignored after this time. */
  readonly expiresAt?: string
}

/** Evaluated permission check result. */
export interface PermissionCheck {
  readonly allowed: boolean
  readonly reason?: string
  readonly missingPermissions?: readonly Permission[]
}

// ─── Audit log ────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'build'
  | 'deploy'
  | 'export'
  | 'view'
  | 'config.update'
  | 'backend.sync'
  | 'role.grant'
  | 'role.revoke'

export interface AuditEntry {
  readonly id: string
  readonly action: AuditAction
  readonly actorId: string
  readonly actorType: 'user' | 'service-account' | 'cron'
  /** ISO 8601 timestamp. */
  readonly timestamp: string
  readonly workbookId: string
  readonly sheetName?: string
  readonly target?: BuildTarget
  readonly metadata?: Record<string, string | number | boolean>
  readonly success: boolean
  readonly errorMessage?: string
  readonly durationMs?: number
}

export interface AuditFilter {
  readonly actorId?: string
  readonly action?: AuditAction | AuditAction[]
  readonly from?: string
  readonly to?: string
  readonly workbookId?: string
  readonly success?: boolean
}

export interface AuditLog {
  list(filter?: AuditFilter): Promise<readonly AuditEntry[]>
  record(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void>
}

// ─── Data connectors ──────────────────────────────────────────────────────────

/** Generic connector used as a `useRange` backend. */
export interface DataConnector<TRow = Record<string, unknown>> {
  readonly name: string
  /** Fetch rows for the given sheet/table reference. */
  fetch(ref: string, options?: ConnectorFetchOptions): Promise<readonly TRow[]>
  /** Push updated rows back to the source (if writable). */
  push?(ref: string, rows: readonly TRow[]): Promise<void>
}

export interface ConnectorFetchOptions {
  readonly limit?: number
  readonly offset?: number
  readonly filter?: Record<string, unknown>
  readonly orderBy?: string
  readonly orderDir?: 'asc' | 'desc'
}

/** SQL/Postgres-compatible connector config. */
export interface SqlConnectorConfig {
  readonly type: 'postgres' | 'mysql' | 'sqlite' | 'mssql'
  readonly connectionString: string
  readonly ssl?: boolean
  readonly poolSize?: number
  readonly queryTimeoutMs?: number
}

/** REST API connector config. */
export interface RestConnectorConfig {
  readonly type: 'rest'
  readonly baseUrl: string
  readonly headers?: Record<string, string>
  readonly authType?: 'none' | 'bearer' | 'basic' | 'api-key'
  readonly authToken?: string
  readonly paginationStyle?: 'offset' | 'cursor' | 'page'
}

/** GraphQL connector config. */
export interface GraphQLConnectorConfig {
  readonly type: 'graphql'
  readonly endpoint: string
  readonly headers?: Record<string, string>
  readonly authToken?: string
}

export type ConnectorConfig =
  | SqlConnectorConfig
  | RestConnectorConfig
  | GraphQLConnectorConfig

// ─── Scheduled builds ─────────────────────────────────────────────────────────

/** Cron expression (standard 5-field: min hour dom mon dow). */
export type CronExpression = string

export type ScheduledJobStatus = 'active' | 'paused' | 'error' | 'completed'

export interface ScheduledBuild {
  readonly id: string
  readonly name: string
  readonly workbookGlob: string
  readonly target: BuildTarget
  readonly out: string
  readonly cron: CronExpression
  readonly timezone?: string
  readonly status: ScheduledJobStatus
  readonly lastRunAt?: string
  readonly lastRunStatus?: 'success' | 'failure'
  readonly nextRunAt?: string
  readonly notifyOnFailure?: readonly string[]
}

// ─── Output versioning ────────────────────────────────────────────────────────

export interface BuildVersion {
  readonly id: string
  readonly workbookId: string
  readonly target: BuildTarget
  readonly builtAt: string
  readonly builtBy: string
  readonly commitSha?: string
  readonly tag?: string
  readonly sizeBytes: number
  readonly downloadUrl?: string
}

export interface VersionStore {
  save(version: Omit<BuildVersion, 'id'>): Promise<BuildVersion>
  list(workbookId: string, limit?: number): Promise<readonly BuildVersion[]>
  get(id: string): Promise<BuildVersion | null>
  rollback(id: string): Promise<void>
}

// ─── Notification / delivery ──────────────────────────────────────────────────

export type DeliveryChannel = 'email' | 'slack' | 'teams' | 'webhook'

export interface EmailDelivery {
  readonly channel: 'email'
  readonly to: readonly string[]
  readonly cc?: readonly string[]
  readonly subject: string
  readonly body?: string
  readonly attachOutput?: boolean
}

export interface SlackDelivery {
  readonly channel: 'slack'
  readonly webhookUrl: string
  readonly channelName: string
  readonly message?: string
  readonly attachOutput?: boolean
}

export interface WebhookDelivery {
  readonly channel: 'webhook'
  readonly url: string
  readonly method?: 'POST' | 'PUT'
  readonly headers?: Record<string, string>
  readonly payloadTemplate?: string
}

export type Delivery = EmailDelivery | SlackDelivery | WebhookDelivery

// ─── SSO / Identity ───────────────────────────────────────────────────────────

export type SsoProvider = 'okta' | 'azure-ad' | 'google-workspace' | 'saml' | 'oidc'

export interface SsoConfig {
  readonly provider: SsoProvider
  readonly issuer: string
  readonly clientId: string
  readonly clientSecret?: string
  readonly redirectUri: string
  readonly scopes?: readonly string[]
  readonly groupMapping?: Record<string, string>
}

export interface IdentityToken {
  readonly sub: string
  readonly email: string
  readonly name?: string
  readonly groups?: readonly string[]
  readonly roles?: readonly string[]
  readonly exp: number
}

// ─── Observability ────────────────────────────────────────────────────────────

export interface BuildMetrics {
  readonly workbookId: string
  readonly target: BuildTarget
  readonly sheetCount: number
  readonly rowCount: number
  readonly buildDurationMs: number
  readonly outputSizeBytes: number
  readonly formulasTranspiled: number
  readonly backendFetchDurationMs?: number
}

export interface HealthStatus {
  readonly status: 'healthy' | 'degraded' | 'unhealthy'
  readonly backends: Record<string, 'up' | 'down' | 'unknown'>
  readonly lastBuildAt?: string
  readonly version: string
}

// ─── Re-export BuildTarget from adapters so enterprise types are self-contained

import type { BuildTarget } from './adapters.js'
export type { BuildTarget }
