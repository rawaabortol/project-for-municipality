import { ALERT_TYPES, RISK_LEVELS } from "../constant/index.js";
import Alert from "../models/Alert.js";
import Report from "../models/Report.js";
import Cluster from "../models/Cluster.js";

class AlertService {
  static generateAlertsForReports(reports = [], clusters = []) {
    const alerts = [];

    clusters.forEach((cluster, idx) => {
      alerts.push({
        id: `ALT-CLS-${idx + 1}`,
        alertCode: `ALT-CLS-${cluster.clusterCode}`,
        alertType: ALERT_TYPES.CLUSTER_DETECTED,
        title: `POTENTIAL PUBLIC HEALTH CLUSTER: ${cluster.categoryName}`,
        description: `Surge of ${cluster.reportCount} interrelated ${cluster.categoryName} incidents detected within ${cluster.district} affecting ~${cluster.totalAffected} people in the last 72 hours. Immediate epidemiological inspection recommended.`,
        relatedClusterId: cluster.clusterCode,
        riskLevel: cluster.riskLevel || RISK_LEVELS.HIGH,
        area: cluster.district,
        status: "ACTIVE",
        assignedOfficer: {
          name: "Dr. Tariq Al-Hajj",
          badgeNumber: "TRP-OFF-01",
        },
        createdAt: cluster.detectedAt || new Date().toISOString(),
      });
    });

    const criticalReports = reports.filter(
      (r) =>
        r.riskLevel === RISK_LEVELS.CRITICAL &&
        r.status !== "RESOLVED" &&
        r.status !== "CLOSED",
    );

    criticalReports.slice(0, 5).forEach((rep) => {
      alerts.push({
        id: `ALT-CRIT-${rep.reportNumber}`,
        alertCode: `ALT-CRIT-${rep.reportNumber}`,
        alertType: ALERT_TYPES.CRITICAL_INCIDENT,
        title: `CRITICAL INCIDENT: ${rep.title}`,
        description: `Critical public health risk (Score: ${rep.riskScore}/100) reported at ${rep.location?.address || rep.location?.district}. Immediate sanitization & isolation protocol required.`,
        relatedReportId: rep._id || rep.id,
        riskLevel: RISK_LEVELS.CRITICAL,
        area: rep.location?.district || "Tripoli",
        status: "ACTIVE",
        assignedOfficer: rep.assignedOfficer || {
          name: "Inspector Layla Khoury",
          badgeNumber: "TRP-OFF-02",
        },
        createdAt: rep.createdAt || new Date().toISOString(),
      });
    });

    const now = Date.now();
    const stagnant = reports.filter((r) => {
      if (
        r.status === "RESOLVED" ||
        r.status === "CLOSED" ||
        r.status === "REJECTED"
      )
        return false;
      const created = new Date(r.createdAt || Date.now()).getTime();
      return now - created > 1000 * 60 * 60 * 24 * 6;
    });

    if (stagnant.length > 0) {
      alerts.push({
        id: "ALT-TIMEOUT-1",
        alertCode: "ALT-TIMEOUT-001",
        alertType: ALERT_TYPES.UNRESOLVED_TIMEOUT,
        title: `UNRESOLVED INCIDENTS EXCEEDING SLA (${stagnant.length} REPORTS)`,
        description: `${stagnant.length} open public health reports have remained unresolved for more than 6 days. Supervisory review mandated.`,
        riskLevel: RISK_LEVELS.MEDIUM,
        area: "City-Wide Tripoli",
        status: "ACTIVE",
        assignedOfficer: {
          name: "Chief Health Admin Nabil Sabbagh",
          badgeNumber: "TRP-ADM-01",
        },
        createdAt: new Date().toISOString(),
      });
    }

    return alerts;
  }

  static async syncAlertsWithDB() {
    try {
      const criticalReports = await Report.find({
        riskLevel: RISK_LEVELS.CRITICAL,
        status: { $nin: ["RESOLVED", "CLOSED", "REJECTED"] },
      });

      const newAlerts = [];

      for (const report of criticalReports) {
        const existingAlert = await Alert.findOne({
          relatedReportId: report._id,
          status: { $in: ["ACTIVE", "ACKNOWLEDGED"] },
        });

        if (!existingAlert) {
          const createdAlert = await Alert.create({
            alertCode: `ALT-${report.reportNumber}`,
            alertType: ALERT_TYPES.CRITICAL_INCIDENT,
            title: `CRITICAL RISK INCIDENT: ${report.title}`,
            description: `Score ${report.riskScore}/100 in ${report.location?.district}. Urgent containment needed.`,
            relatedReportId: report._id,
            riskLevel: RISK_LEVELS.CRITICAL,
            area: report.location?.district || "Tripoli",
            status: "ACTIVE",
            assignedOfficer: report.assignedOfficer
              ? {
                  userId: report.assignedOfficer.userId,
                  name: report.assignedOfficer.name,
                }
              : undefined,
          });

          newAlerts.push(createdAlert);
        }
      }

      return newAlerts;
    } catch (error) {
      console.error("Error syncing alerts with Mongoose in MongoDB:", error);
      throw error;
    }
  }

  static async getAlertsFromDB(filter = {}) {
    return Alert.find(filter)
      .populate("relatedReportId")
      .populate("relatedClusterId")
      .sort({ createdAt: -1 })
      .lean();
  }

  static async acknowledgeAlertInDB(alertId, officer) {
    return Alert.findByIdAndUpdate(
      alertId,
      {
        status: "ACKNOWLEDGED",
        assignedOfficer: officer
          ? {
              userId: officer._id || officer.id,
              name: officer.name,
            }
          : undefined,
      },
      { new: true },
    );
  }

  static async resolveAlertInDB(alertId) {
    return Alert.findByIdAndUpdate(
      alertId,
      { status: "RESOLVED" },
      { new: true },
    );
  }
}

export const generateAlertsForReports = AlertService.generateAlertsForReports;
export const syncAlertsWithDB = AlertService.syncAlertsWithDB;
export const getAlertsFromDB = AlertService.getAlertsFromDB;
export const acknowledgeAlertInDB = AlertService.acknowledgeAlertInDB;
export const resolveAlertInDB = AlertService.resolveAlertInDB;
export default AlertService;
