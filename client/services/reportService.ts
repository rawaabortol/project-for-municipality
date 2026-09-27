import { calculateReportRisk } from "../utils/riskEngine";
import { dbInstance } from "../utils/axios";
import { Report } from "../utils/sampleData";

/**
 * Browser-safe report service.
 */
export const reportService = {
  getReports: (): Report[] => {
    return [...dbInstance.reports];
  },

  getReportById: (id: string): Report | undefined => {
    return dbInstance.reports.find(
      (r) => r.id === id || r.reportNumber === id || (r as any)._id === id,
    );
  },

  getCitizenReports: (userId: string): Report[] => {
    return dbInstance.reports.filter((r) => r.citizen.userId === userId);
  },

  createReport: (reportData: any, currentUser: any): Report => {
    // 1. Calculate risk factors using the riskEngine
    const risk = calculateReportRisk(reportData, dbInstance.reports);

    // 2. Format conforming to Mongoose reportSchema
    const count = dbInstance.reports.length;
    const reportNumber = `TRP-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    const severity = (
      ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(reportData.initialSeverity)
        ? reportData.initialSeverity
        : ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(reportData.severity)
          ? reportData.severity
          : "MEDIUM"
    ) as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reportNumber,
      citizen: {
        userId: currentUser?.id || currentUser?._id || "anonymous",
        name:
          currentUser?.name || reportData.citizen?.name || "Citizen Reporter",
        phone: currentUser?.phone || reportData.citizen?.phone || "",
        email: currentUser?.email || reportData.citizen?.email || "",
      },
      category:
        typeof reportData.category === "object"
          ? reportData.category
          : {
              name: reportData.category || "General Sanitary",
              code: "SAN-GEN",
            },
      title: reportData.title,
      description: reportData.description,
      incidentDate: reportData.incidentDate || new Date().toISOString(),
      location: {
        address:
          reportData.location?.address ||
          reportData.location?.streetAddress ||
          "Tripoli",
        district: reportData.location?.district || "Al-Tal",
        lat: Number(reportData.location?.lat) || 34.4367,
        lng: Number(reportData.location?.lng) || 35.8497,
      },
      affectedCount: Number(reportData.affectedCount) || 1,
      initialSeverity: severity,
      imageUrl: reportData.images?.[0] || reportData.imageUrl || "",
      additionalComments: reportData.additionalComments || "",
      status: "SUBMITTED",
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      riskFactors: risk.factors,
      statusHistory: [
        {
          oldStatus: "NONE",
          newStatus: "SUBMITTED",
          changedBy: currentUser?.name || "Citizen Reporter",
          role: currentUser?.role || "CITIZEN",
          timestamp: new Date().toISOString(),
          comment:
            "Initial incident report submitted into municipal surveillance.",
        },
      ],
      createdAt: new Date().toISOString(),
    };

    return dbInstance.addReport(newReport, currentUser);
  },

  updateStatus: (
    reportId: string,
    newStatus: any,
    comment: string,
    user: any,
  ): Report | null => {
    return dbInstance.updateReportStatus(reportId, newStatus, comment, user);
  },

  assignOfficer: (reportId: string, officer: any, user: any): Report | null => {
    return dbInstance.assignOfficer(reportId, officer, user);
  },
};

export default reportService;
