import mongoose from "mongoose";
import Report from "../models/Report.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { calculateReportRisk, assessAndSaveReportRisk } from "./riskEngine.js";
import { logAuditAction } from "./auditService.js";
import { createWithSequentialCode } from "./sequence.service.js";
import NotificationService from "./notification.service.js";
import AlertService from "./alert.service.js";
import ClusterDetectionService from "./clusterDetection.service.js";
import { httpError } from "../middleware/errorHandler.js";
import {
  REPORT_STATUSES,
  RISK_LEVELS,
  SEVERITY_LEVELS,
  USER_ROLES,
} from "../constant/index.js";

/**
 * Allowed forward transitions of the report workflow.
 * CLOSED and REJECTED are terminal.
 */
const STATUS_TRANSITIONS = {
  [REPORT_STATUSES.SUBMITTED]: [
    REPORT_STATUSES.UNDER_REVIEW,
    REPORT_STATUSES.VERIFIED,
    REPORT_STATUSES.REJECTED,
  ],
  [REPORT_STATUSES.UNDER_REVIEW]: [REPORT_STATUSES.VERIFIED, REPORT_STATUSES.REJECTED],
  [REPORT_STATUSES.VERIFIED]: [REPORT_STATUSES.IN_INVESTIGATION, REPORT_STATUSES.REJECTED],
  [REPORT_STATUSES.IN_INVESTIGATION]: [REPORT_STATUSES.RESOLVED, REPORT_STATUSES.REJECTED],
  [REPORT_STATUSES.RESOLVED]: [REPORT_STATUSES.CLOSED],
  [REPORT_STATUSES.CLOSED]: [],
  [REPORT_STATUSES.REJECTED]: [],
};

const isStaff = (user) =>
  user?.role === USER_ROLES.HEALTH_OFFICER || user?.role === USER_ROLES.ADMINISTRATOR;

const actorOf = (user) => ({
  userId: user?._id || user?.id,
  name: user?.name || "Municipal System",
  role: user?.role || "SYSTEM",
});

const resolveCategory = async (input) => {
  const name = typeof input === "object" ? input?.name : input;
  const code = typeof input === "object" ? input?.code : undefined;
  if (!name && !code) throw httpError(400, "Category is required");

  const category = await Category.findOne({
    $or: [code ? { code: String(code).toUpperCase() } : null, name ? { name } : null].filter(Boolean),
  }).lean();

  if (category) {
    if (category.isActive === false) throw httpError(400, `Category "${category.name}" is disabled`);
    return { categoryId: category._id, name: category.name, code: category.code };
  }
  return {
    name: String(name || code),
    code: String(code || name).toUpperCase().replace(/[^A-Z0-9]+/g, "_"),
  };
};

/**
 * Ensures a status transition is legal; throws a 400 otherwise.
 */
export const assertTransition = (from, to) => {
  if (!Object.values(REPORT_STATUSES).includes(to)) {
    throw httpError(400, `Invalid status: ${to}`);
  }
  if (!STATUS_TRANSITIONS[from]?.includes(to)) {
    throw httpError(400, `Illegal status transition: ${from} -> ${to}`);
  }
};

class ReportService {
  static async getReportsFromDB(filter = {}, { page = 1, limit = 50 } = {}) {
    const query = {};
    if (filter.status) query.status = filter.status;
    if (filter.riskLevel) query.riskLevel = filter.riskLevel;
    if (filter.district) query["location.district"] = filter.district;
    if (filter.category) query["category.name"] = filter.category;
    if (filter.citizenId) query["citizen.userId"] = filter.citizenId;

    const safeLimit = Math.min(Math.max(limit, 1), 500);
    const safePage = Math.max(page, 1);
    const [reports, total] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      Report.countDocuments(query),
    ]);

    return {
      reports,
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  static async getReportByIdFromDB(id, user) {
    const report = await Report.findById(id).lean();
    if (!report) throw httpError(404, "Report not found");
    if (!isStaff(user) && String(report.citizen?.userId) !== String(user?._id || user?.id)) {
      throw httpError(403, "You can only view your own reports");
    }
    return report;
  }

  static async createReportInDB(reportData = {}, user) {
    const severity = String(reportData.initialSeverity || SEVERITY_LEVELS.MEDIUM).toUpperCase();
    if (!Object.values(SEVERITY_LEVELS).includes(severity)) {
      throw httpError(400, `Invalid severity: ${reportData.initialSeverity}`);
    }

    const category = await resolveCategory(reportData.category);
    const location = {
      district: reportData.location?.district || "Al-Tal",
      address:
        String(reportData.location?.address || "").trim() ||
        `${reportData.location?.district || "Tripoli"}, Lebanon`,
      lat: Number(reportData.location?.lat ?? 34.4367),
      lng: Number(reportData.location?.lng ?? 35.8497),
    };
    const affectedCount = Math.max(0, Number(reportData.affectedCount) || 1);
    const incidentDate = reportData.incidentDate ? new Date(reportData.incidentDate) : new Date();

    const existingReports = await Report.find({
      status: { $nin: [REPORT_STATUSES.REJECTED, REPORT_STATUSES.CLOSED] },
    })
      .select("location category")
      .lean();
    const risk = calculateReportRisk(
      { category, initialSeverity: severity, affectedCount, incidentDate, location },
      existingReports,
    );

    const prefix = `TRP-${new Date().getFullYear()}-`;
    const newReport = await createWithSequentialCode(Report, "reportNumber", prefix, (reportNumber) => ({
      reportNumber,
      citizen: {
        userId: user?._id,
        name: user?.name || "Anonymous Citizen",
        phone: user?.phone || "",
        email: user?.email || "",
      },
      category,
      title: reportData.title,
      description: reportData.description,
      incidentDate,
      location,
      affectedCount,
      initialSeverity: severity,
      imageUrl: reportData.imageUrl || "",
      additionalComments: reportData.additionalComments || "",
      status: REPORT_STATUSES.SUBMITTED,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      riskFactors: risk.factors,
      statusHistory: [
        {
          oldStatus: "NONE",
          newStatus: REPORT_STATUSES.SUBMITTED,
          changedBy: actorOf(user),
          timestamp: new Date(),
          comment: "Initial incident report submitted into municipal surveillance.",
        },
      ],
    }));

    await logAuditAction({
      user,
      action: "SUBMIT_REPORT",
      resource: `Report #${newReport.reportNumber}`,
      details: `Incident: ${newReport.title} in ${newReport.location.district} (Risk: ${newReport.riskLevel})`,
    });

    await ReportService.runPostSubmissionSurveillance(newReport);
    return newReport;
  }

  /**
   * Raises an alert for critical reports and re-runs cluster detection.
   * Errors are logged so a surveillance hiccup never fails the citizen's submission.
   */
  static async runPostSubmissionSurveillance(report) {
    try {
      if (report.riskLevel === RISK_LEVELS.CRITICAL) {
        await AlertService.createCriticalAlertForReport(report);
        await NotificationService.notifyStaff({
          title: "New Critical Incident Alert",
          message: `Report #${report.reportNumber} in ${report.location.district} scored ${report.riskScore}/100.`,
          type: "CRITICAL_ALERT",
        });
      }
      await ClusterDetectionService.runClusterDetectionAndPersist();
    } catch (error) {
      console.error("Post-submission surveillance failed:", error);
    }
  }

  static async updateReportStatusInDB(reportId, newStatus, user, comment = "") {
    const report = await Report.findById(reportId);
    if (!report) throw httpError(404, "Report not found");

    const oldStatus = report.status;
    assertTransition(oldStatus, newStatus);

    report.status = newStatus;
    report.statusHistory.push({
      oldStatus,
      newStatus,
      changedBy: actorOf(user),
      timestamp: new Date(),
      comment: comment || `Status updated from ${oldStatus} to ${newStatus}`,
    });
    await report.save();

    await logAuditAction({
      user,
      action: "UPDATE_REPORT_STATUS",
      resource: `Report #${report.reportNumber}`,
      details: `Status transition: ${oldStatus} -> ${newStatus}. Note: ${comment}`,
    });

    await NotificationService.notifyUser(report.citizen?.userId, {
      title: `Report #${report.reportNumber} Updated`,
      message: `Your report status changed to "${newStatus}".${comment ? ` Note: ${comment}` : ""}`,
      type: "STATUS_UPDATE",
    });

    return report;
  }

  static async assignOfficerInDB(reportId, officerId, actor) {
    if (!mongoose.isValidObjectId(officerId)) throw httpError(400, "Valid officerId is required");

    const [report, officer] = await Promise.all([
      Report.findById(reportId),
      User.findById(officerId).select("-password").lean(),
    ]);
    if (!report) throw httpError(404, "Report not found");
    if (!officer || !isStaff(officer) || officer.isActive === false) {
      throw httpError(400, "Selected user is not an active health officer");
    }
    if ([REPORT_STATUSES.CLOSED, REPORT_STATUSES.REJECTED].includes(report.status)) {
      throw httpError(400, `Cannot assign an officer to a ${report.status} report`);
    }

    const oldStatus = report.status;
    report.assignedOfficer = {
      officerId: officer._id,
      name: officer.name,
      badgeNumber: officer.badgeNumber || "",
    };
    if (oldStatus === REPORT_STATUSES.SUBMITTED || oldStatus === REPORT_STATUSES.UNDER_REVIEW) {
      report.status = REPORT_STATUSES.VERIFIED;
    }
    report.statusHistory.push({
      oldStatus,
      newStatus: report.status,
      changedBy: actorOf(actor),
      timestamp: new Date(),
      comment: `Assigned investigating officer: ${officer.name} (${officer.badgeNumber || "Inspector"})`,
    });
    await report.save();

    await logAuditAction({
      user: actor,
      action: "ASSIGN_OFFICER",
      resource: `Report #${report.reportNumber}`,
      details: `Assigned ${officer.name} (${officer.badgeNumber || "no badge"})`,
    });
    await NotificationService.notifyUser(officer._id, {
      title: `Assignment: Report #${report.reportNumber}`,
      message: `You have been assigned to "${report.title}" in ${report.location.district}.`,
      type: "ASSIGNMENT",
    });
    if (report.status !== oldStatus) {
      await NotificationService.notifyUser(report.citizen?.userId, {
        title: `Report #${report.reportNumber} Verified`,
        message: `Your report has been verified and assigned to ${officer.name}.`,
        type: "STATUS_UPDATE",
      });
    }

    return report;
  }

  /**
   * Re-runs the risk engine over every open report and persists a RiskAssessment for each.
   */
  static async reassessAllRisks(actor) {
    const openReports = await Report.find({
      status: { $nin: [REPORT_STATUSES.REJECTED, REPORT_STATUSES.CLOSED] },
    })
      .select("_id")
      .lean();

    for (const { _id } of openReports) {
      await assessAndSaveReportRisk(_id);
    }

    await logAuditAction({
      user: actor,
      action: "REASSESS_RISK",
      resource: "All open reports",
      details: `${openReports.length} reports re-scored`,
    });
    return openReports.length;
  }
}

export const getReportsFromDB = ReportService.getReportsFromDB;
export const getReportByIdFromDB = ReportService.getReportByIdFromDB;
export const createReportInDB = ReportService.createReportInDB;
export const updateReportStatusInDB = ReportService.updateReportStatusInDB;
export default ReportService;
