import { getAuditLogsFromDB } from "../service/auditService.js";
import asyncHandler from "../middleware/asyncHandler.js";

class AuditController {
  static getAuditLogs = asyncHandler(async (req, res) => {
    const { page, limit, action, userId } = req.query;
    const result = await getAuditLogsFromDB({
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Math.max(Number(limit) || 100, 1), 500),
      action: action ? String(action) : null,
      userId: userId ? String(userId) : null,
    });
    return res.json({ success: true, ...result });
  });
}

export default AuditController;
