import AuditLog from '../models/AuditLog.js';

/**
 * Synchronous Audit Log Object Formatter
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

/**
 * Mongoose Database-backed Audit Logger:
 * Persists immutable audit trail entry directly into MongoDB
 */
export async function logAuditAction({ user, action, resource, details = '', ip = '127.0.0.1' }) {
  try {
    const entry = await AuditLog.create({
      userId: user?._id || user?.id || undefined,
      userName: user?.name || 'Municipal System',
      userRole: user?.role || 'SYSTEM',
      action,
      resource,
      details,
      ipAddress: ip
    });
    return entry;
  } catch (error) {
    console.error('Failed to write audit log to MongoDB with Mongoose:', error);
    // Non-blocking for primary transaction
    return null;
  }
}

/**
 * Retrieve Audit Logs from MongoDB via Mongoose
 */
export async function getAuditLogsFromDB({ page = 1, limit = 50, action = null, userId = null } = {}) {
  try {
    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query)
    ]);

    return { logs, total, page, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error('Error fetching audit logs with Mongoose:', error);
    throw error;
  }
}
