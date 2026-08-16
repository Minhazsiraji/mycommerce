/**
 * Public API of the admin module. Server-side only.
 *
 * Holds cross-cutting operator concerns — currently the audit trail — rather
 * than any one domain's behaviour. Admin screens live under app/admin and use
 * the relevant domain module directly.
 */

export {
  listAuditLogs,
  listAuditLogsFor,
  pruneAuditLogs,
  recordAudit,
} from './audit'
export type { AuditLog } from './schema'
