import Report from "../models/Report.js";
import { calculateReportRisk } from "./riskEngine.js";
import { logAuditAction } from "./auditService.js";
import { REPORT_STATUSES } from "../constant/index.js";

class ReportService {
  static async getReportsFromDB(filter = {}, { page = 1, limit = 50 } = {}) {
    try {
      const query = {};
      if (filter.status) query.status = filter.status;
      if (filter.riskLevel) query.riskLevel = filter.riskLevel;
      if (filter.district) query["location.district"] = filter.district;
      if (filter.category) query["category.name"] = filter.category;
      if (filter.citizenId) query["citizen.userId"] = filter.citizenId;

      const skip = (page - 1) * limit;
      const [reports, total] = await Promise.all([
        Report.find(query)
          .sort({ incidentDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Report.countDocuments(query),
      ]);

      return { reports, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      console.error("Error fetching reports from MongoDB via Mongoose:", error);
      throw error;
    }
  }

  static async getReportByIdFromDB(id) {
    return Report.findById(id).lean();
  }

  static async createReportInDB(reportData, user) {
    try {
      const existingReports = await Report.find({
        status: { $nin: ["REJECTED", "CLOSED"] },
      }).lean();
      const risk = calculateReportRisk(reportData, existingReports);
      const count = await Report.countDocuments();
      const reportNumber = `TRP-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      const newReport = await Report.create({
        reportNumber,
        citizen: {
          userId: user?._id || user?.id || undefined,
          name: user?.name || reportData.citizen?.name || "Anonymous Citizen",
          phone: user?.phone || reportData.citizen?.phone || "",
          email: user?.email || reportData.citizen?.email || "",
        },
        category: {
          name:
            reportData.category?.name ||
            reportData.category ||
            "General Sanitary",
          code: reportData.category?.code || "SAN-GEN",
        },
        title: reportData.title,
        description: reportData.description,
        incidentDate: reportData.incidentDate || new Date(),
        location: {
          district: reportData.location?.district || "Al-Tal",
          streetAddress:
            reportData.location?.streetAddress ||
            reportData.location?.address ||
            "Tripoli",
          lat: reportData.location?.lat || 34.4367,
          lng: reportData.location?.lng || 35.8497,
        },
        affectedCount: Number(reportData.affectedCount) || 1,
        initialSeverity:
          reportData.initialSeverity || reportData.severity || "MEDIUM",
        status: REPORT_STATUSES.SUBMITTED,
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel,
        riskFactors: risk.factors,
        images: reportData.images || [],
        statusHistory: [
          {
            oldStatus: "NONE",
            newStatus: REPORT_STATUSES.SUBMITTED,
            changedBy: {
              userId: user?._id || user?.id,
              name: user?.name || "Citizen Reporter",
              role: user?.role || "CITIZEN",
            },
            timestamp: new Date(),
            comment:
              "Initial incident report submitted into municipal surveillance.",
          },
        ],
      });

      await logAuditAction({
        user,
        action: "SUBMIT_REPORT",
        resource: `Report #${newReport.reportNumber}`,
        details: `Incident: ${newReport.title} in ${newReport.location.district} (Risk: ${newReport.riskLevel})`,
      });

      return newReport;
    } catch (error) {
      console.error("Error creating report in MongoDB via Mongoose:", error);
      throw error;
    }
  }

  static async updateReportStatusInDB(reportId, newStatus, user, comment = "") {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new Error(`Report ${reportId} not found`);
      }

      const oldStatus = report.status;
      report.status = newStatus;
      report.statusHistory.push({
        oldStatus,
        newStatus,
        changedBy: {
          userId: user?._id || user?.id,
          name: user?.name || "Health Officer",
          role: user?.role || "HEALTH_OFFICER",
        },
        timestamp: new Date(),
        comment,
      });

      await report.save();

      await logAuditAction({
        user,
        action: "UPDATE_REPORT_STATUS",
        resource: `Report #${report.reportNumber}`,
        details: `Status transition: ${oldStatus} -> ${newStatus}. Note: ${comment}`,
      });

      return report;
    } catch (error) {
      console.error(
        "Error updating report status in MongoDB via Mongoose:",
        error,
      );
      throw error;
    }
  }
}

export const getReportsFromDB = ReportService.getReportsFromDB;
export const getReportByIdFromDB = ReportService.getReportByIdFromDB;
export const createReportInDB = ReportService.createReportInDB;
export const updateReportStatusInDB = ReportService.updateReportStatusInDB;
export default ReportService;
