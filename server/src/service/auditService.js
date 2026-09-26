/**
 * Audit Logging Service
 */
export function createAuditLogEntry({ user, action, resource, details, ip = '127.0.0.1' }) {
  return {
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user?._id || user?.id || 'system',
    userName: user?.name || 'System Operator',
    userRole: user?.role || 'SYSTEM',
    action,
    resource,
    details,
    ipAddress: ip,
    timestamp: new Date().toISOString()
  };
}
