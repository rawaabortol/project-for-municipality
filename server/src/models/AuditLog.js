import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: {
      type: String,
      required: true
    },
    userRole: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true // e.g., 'VERIFY_REPORT', 'ASSIGN_OFFICER', 'STATUS_CHANGE', 'CLUSTER_DETECTED', 'USER_ROLE_CHANGE'
    },
    resource: {
      type: String,
      required: true // e.g., 'Report #TRP-2026-0012'
    },
    details: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
