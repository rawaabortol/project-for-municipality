import { ALERT_TYPES, RISK_LEVELS } from "../constant/index.js";
import Alert from "../models/Alert.js";
import Report from "../models/Report.js";
import { logAuditAction } from "./auditService.js";
import { httpError } from "../middleware/errorHandler.js";

const OPEN_ALERT_STATUSES = ["ACTIVE", "ACKNOWLEDGED"];

class AlertService {
  /**
   * Creates an ACTIVE critical-incident alert for a report unless one is already open.
   */
  static async createCriticalAlertForReport(report) {
    const existingAlert = await Alert.findOne({
      relatedReportId: report._id,
      status: { $in: OPEN_ALERT_STATUSES },
    });
    if (existingAlert) return null;

    // alertCode is unique: suffix with a timestamp so a re-raised alert (after a resolved one) doesn't collide
    return Alert.create({
      alertCode: `ALT-${report.reportNumber}-${Date.now().toString(36).toUpperCase()}`,
      alertType: ALERT_TYPES.CRITICAL_INCIDENT,
      title: `CRITICAL RISK INCIDENT: ${report.title}`,
      description: `Score ${report.riskScore}/100 in ${report.location?.district}. ${report.affectedCount} individuals exposed. Urgent containment needed.`,
      relatedReportId: report._id,
      riskLevel: RISK_LEVELS.CRITICAL,
      area: report.location?.district || "Tripoli",
      status: "ACTIVE",
      assignedOfficer: report.assignedOfficer?.officerId
        ? {
            userId: report.assignedOfficer.officerId,
            name: report.assignedOfficer.name,
          }
        : undefined,
    });
  }

  /**
   * Ensures every open critical report has an open alert.
   */
  static async syncAlertsWithDB() {
    const criticalReports = await Report.find({
      riskLevel: RISK_LEVELS.CRITICAL,
      status: { $nin: ["RESOLVED", "CLOSED", "REJECTED"] },
    });

    const newAlerts = [];
    for (const report of criticalReports) {
      const created = await AlertService.createCriticalAlertForReport(report);
      if (created) newAlerts.push(created);
    }
    return newAlerts;
  }

  static async getAlertsFromDB(filter = {}) {
    return Alert.find(filter)
      .populate("relatedReportId", "reportNumber title status")
      .populate("relatedClusterId", "clusterCode categoryName district status")
      .sort({ createdAt: -1 })
      .lean();
  }

  static async acknowledgeAlertInDB(alertId, officer) {
    const alert = await Alert.findById(alertId);
    if (!alert) throw httpError(404, "Alert not found");
    if (alert.status !== "ACTIVE") {
      throw httpError(400, `Only ACTIVE alerts can be acknowledged (current: ${alert.status})`);
    }

    alert.status = "ACKNOWLEDGED";
    alert.assignedOfficer = { userId: officer._id, name: officer.name };
    await alert.save();

    await logAuditAction({
      user: officer,
      action: "ACKNOWLEDGE_ALERT",
      resource: `Alert ${alert.alertCode}`,
      details: alert.title,
    });
    return alert;
  }

  static async resolveAlertInDB(alertId, user) {
    const alert = await Alert.findById(alertId);
    if (!alert) throw httpError(404, "Alert not found");
    if (alert.status === "RESOLVED") return alert;

    alert.status = "RESOLVED";
    await alert.save();

    await logAuditAction({
      user,
      action: "RESOLVE_ALERT",
      resource: `Alert ${alert.alertCode}`,
      details: alert.title,
    });
    return alert;
  }
}

export default AlertService;
