import Investigation from "../models/Investigation.js";
import Report from "../models/Report.js";
import { logAuditAction } from "./auditService.js";
import { createWithSequentialCode } from "./sequence.service.js";
import NotificationService from "./notification.service.js";
import { assertTransition } from "./report.service.js";
import { httpError } from "../middleware/errorHandler.js";
import {
  INVESTIGATION_STATUSES,
  INVESTIGATION_RESULTS,
  REPORT_STATUSES,
} from "../constant/index.js";

const EDITABLE_FIELDS = [
  "findings",
  "actionsTaken",
  "recommendations",
  "result",
  "samplesCollected",
  "notes",
  "status",
  "investigationDate",
];

const pickEditable = (data = {}) =>
  Object.fromEntries(
    EDITABLE_FIELDS.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]),
  );

const actorOf = (user) => ({
  userId: user?._id,
  name: user?.name || "Health Officer",
  role: user?.role || "HEALTH_OFFICER",
});

const moveReport = (report, newStatus, user, comment) => {
  assertTransition(report.status, newStatus);
  report.statusHistory.push({
    oldStatus: report.status,
    newStatus,
    changedBy: actorOf(user),
    timestamp: new Date(),
    comment,
  });
  report.status = newStatus;
};

const findOpenInvestigation = (reportId) =>
  Investigation.findOne({
    reportId,
    status: { $ne: INVESTIGATION_STATUSES.COMPLETED },
  }).sort({ createdAt: -1 });

const createInvestigationDoc = (report, officerUser, data) =>
  createWithSequentialCode(
    Investigation,
    "investigationCode",
    `INV-${new Date().getFullYear()}-`,
    (investigationCode) => ({
      investigationCode,
      reportId: report._id,
      reportNumber: report.reportNumber,
      officer: {
        userId: officerUser._id,
        name: officerUser.name,
        badgeNumber: officerUser.badgeNumber || "",
      },
      investigationDate: data.investigationDate || new Date(),
      findings: data.findings,
      actionsTaken: data.actionsTaken,
      recommendations: data.recommendations,
      result: data.result || INVESTIGATION_RESULTS.INCONCLUSIVE,
      samplesCollected: data.samplesCollected || "None",
      notes: data.notes || "",
      status: data.status || INVESTIGATION_STATUSES.IN_PROGRESS,
    }),
  );

class InvestigationService {
  static async getInvestigationsFromDB(filter = {}) {
    return Investigation.find(filter)
      .populate("reportId", "reportNumber title status location category riskLevel")
      .sort({ investigationDate: -1 })
      .lean();
  }

  /**
   * Opens a field investigation on a VERIFIED report (moving it to IN_INVESTIGATION),
   * or updates the open draft if one already exists for that report.
   */
  static async createInvestigationInDB(data = {}, officerUser) {
    const report = await Report.findById(data.reportId);
    if (!report) throw httpError(404, "Report not found");

    const existing = await findOpenInvestigation(report._id);
    if (existing) {
      const fields = pickEditable(data);
      if (fields.status === INVESTIGATION_STATUSES.COMPLETED) delete fields.status; // completing goes through finalize
      Object.assign(existing, fields);
      await existing.save();
      await logAuditAction({
        user: officerUser,
        action: "UPDATE_INVESTIGATION",
        resource: `Investigation #${existing.investigationCode}`,
        details: `Draft updated for Report #${existing.reportNumber}`,
      });
      return existing;
    }

    if (report.status !== REPORT_STATUSES.IN_INVESTIGATION) {
      assertTransition(report.status, REPORT_STATUSES.IN_INVESTIGATION);
    }

    const investigation = await createInvestigationDoc(report, officerUser, {
      ...data,
      status:
        data.status === INVESTIGATION_STATUSES.PENDING
          ? INVESTIGATION_STATUSES.PENDING
          : INVESTIGATION_STATUSES.IN_PROGRESS,
    });

    if (report.status !== REPORT_STATUSES.IN_INVESTIGATION) {
      moveReport(
        report,
        REPORT_STATUSES.IN_INVESTIGATION,
        officerUser,
        `Field investigation initiated (${investigation.investigationCode})`,
      );
      await report.save();
      await NotificationService.notifyUser(report.citizen?.userId, {
        title: `Report #${report.reportNumber} Under Investigation`,
        message: "A health officer has opened a field investigation for your report.",
        type: "STATUS_UPDATE",
      });
    }

    await logAuditAction({
      user: officerUser,
      action: "CREATE_INVESTIGATION",
      resource: `Investigation #${investigation.investigationCode}`,
      details: `Target: Report #${investigation.reportNumber}. Result: ${investigation.result}`,
    });

    return investigation;
  }

  static async updateInvestigationInDB(id, updateData, user) {
    const updated = await Investigation.findByIdAndUpdate(id, pickEditable(updateData), {
      new: true,
      runValidators: true,
    });
    if (!updated) throw httpError(404, "Investigation not found");

    await logAuditAction({
      user,
      action: "UPDATE_INVESTIGATION",
      resource: `Investigation #${updated.investigationCode}`,
      details: `Status: ${updated.status}, Result: ${updated.result}`,
    });

    return updated;
  }

  /**
   * Completes the field investigation for a report and moves the report IN_INVESTIGATION -> RESOLVED.
   */
  static async finalizeInvestigationInDB(reportId, closingData = {}, user) {
    const report = await Report.findById(reportId);
    if (!report) throw httpError(404, "Report not found");
    assertTransition(report.status, REPORT_STATUSES.RESOLVED);

    const fields = {
      ...pickEditable(closingData),
      result: closingData.result || INVESTIGATION_RESULTS.RESOLVED,
      status: INVESTIGATION_STATUSES.COMPLETED,
    };

    let investigation = await findOpenInvestigation(report._id);
    if (investigation) {
      Object.assign(investigation, fields);
      await investigation.save();
    } else {
      investigation = await createInvestigationDoc(report, user, {
        findings: "Field remediation inspection completed and verified.",
        actionsTaken: "Containment and municipal sanitization executed.",
        recommendations: "Regular surveillance monitoring instituted.",
        ...fields,
      });
    }

    moveReport(
      report,
      REPORT_STATUSES.RESOLVED,
      user,
      closingData.notes ||
        `Field inspection finalized (${investigation.investigationCode}); incident marked RESOLVED.`,
    );
    await report.save();

    await logAuditAction({
      user,
      action: "FINALIZE_INVESTIGATION",
      resource: `Investigation #${investigation.investigationCode}`,
      details: `Report #${report.reportNumber} resolved. Result: ${investigation.result}`,
    });
    await NotificationService.notifyUser(report.citizen?.userId, {
      title: `Incident #${report.reportNumber} Resolved`,
      message: "Your public health incident report has been inspected and officially marked as RESOLVED.",
      type: "STATUS_UPDATE",
    });

    return { report, investigation };
  }
}

export default InvestigationService;
