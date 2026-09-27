import Investigation from "../models/Investigation.js";
import Report from "../models/Report.js";
import { logAuditAction } from "./auditService.js";
import {
  INVESTIGATION_STATUSES,
  INVESTIGATION_RESULTS,
  REPORT_STATUSES,
} from "../constant/index.js";

class InvestigationService {
  static async getInvestigationsFromDB(filter = {}) {
    try {
      return Investigation.find(filter)
        .populate("reportId")
        .sort({ investigationDate: -1 })
        .lean();
    } catch (error) {
      console.error("Error fetching investigations with Mongoose:", error);
      throw error;
    }
  }

  static async createInvestigationInDB(data, officerUser) {
    try {
      const count = await Investigation.countDocuments();
      const investigationCode = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      const report = await Report.findById(data.reportId);

      const investigation = await Investigation.create({
        investigationCode,
        reportId: data.reportId,
        reportNumber: data.reportNumber || report?.reportNumber || "TRP-REF",
        officer: {
          userId: officerUser?._id || officerUser?.id || undefined,
          name: officerUser?.name || "Dr. Health Officer",
          badgeNumber: officerUser?.badgeNumber || "TRP-OFF-01",
        },
        investigationDate: data.investigationDate || new Date(),
        findings: data.findings,
        actionsTaken: data.actionsTaken,
        recommendations: data.recommendations,
        result: data.result || INVESTIGATION_RESULTS.INCONCLUSIVE,
        samplesCollected: data.samplesCollected || "None",
        notes: data.notes || "",
        status: INVESTIGATION_STATUSES.IN_PROGRESS,
      });

      if (report && report.status !== REPORT_STATUSES.IN_INVESTIGATION) {
        report.status = REPORT_STATUSES.IN_INVESTIGATION;
        report.statusHistory.push({
          oldStatus: report.status,
          newStatus: REPORT_STATUSES.IN_INVESTIGATION,
          changedBy: {
            userId: officerUser?._id || officerUser?.id,
            name: officerUser?.name || "Health Officer",
            role: officerUser?.role || "HEALTH_OFFICER",
          },
          timestamp: new Date(),
          comment: `Field investigation initiated (${investigationCode})`,
        });
        await report.save();
      }

      await logAuditAction({
        user: officerUser,
        action: "CREATE_INVESTIGATION",
        resource: `Investigation #${investigationCode}`,
        details: `Target: Report #${investigation.reportNumber}. Result: ${investigation.result}`,
      });

      return investigation;
    } catch (error) {
      console.error("Error creating investigation with Mongoose:", error);
      throw error;
    }
  }

  static async updateInvestigationInDB(id, updateData, user) {
    try {
      const updated = await Investigation.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true },
      );

      await logAuditAction({
        user,
        action: "UPDATE_INVESTIGATION",
        resource: `Investigation #${updated?.investigationCode || id}`,
        details: `Status: ${updated?.status}, Result: ${updated?.result}`,
      });

      return updated;
    } catch (error) {
      console.error("Error updating investigation with Mongoose:", error);
      throw error;
    }
  }
}

export const getInvestigationsFromDB =
  InvestigationService.getInvestigationsFromDB;
export const createInvestigationInDB =
  InvestigationService.createInvestigationInDB;
export const updateInvestigationInDB =
  InvestigationService.updateInvestigationInDB;
export default InvestigationService;
