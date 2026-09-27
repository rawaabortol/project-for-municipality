import ReportService from "../service/report.service.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { USER_ROLES } from "../constant/index.js";

const asString = (value) => (value === undefined ? undefined : String(value));

class ReportController {
  static getReports = asyncHandler(async (req, res) => {
    const { status, district, riskLevel, category, page, limit, mine } = req.query;
    const filter = {
      status: asString(status),
      district: asString(district),
      riskLevel: asString(riskLevel),
      category: asString(category),
    };
    // Citizens may only list their own reports; staff can opt in with ?mine=true
    if (req.user.role === USER_ROLES.CITIZEN || mine === "true") {
      filter.citizenId = req.user._id;
    }

    const result = await ReportService.getReportsFromDB(filter, {
      page: Number(page) || 1,
      limit: Number(limit) || 50,
    });
    return res.json({ success: true, ...result });
  });

  static getReportById = asyncHandler(async (req, res) => {
    const report = await ReportService.getReportByIdFromDB(req.params.id, req.user);
    return res.json({ success: true, report });
  });

  static createReport = asyncHandler(async (req, res) => {
    const report = await ReportService.createReportInDB(req.body, req.user);
    return res.status(201).json({ success: true, report });
  });

  static updateReportStatus = asyncHandler(async (req, res) => {
    const { newStatus, comment } = req.body;
    const report = await ReportService.updateReportStatusInDB(
      req.params.id,
      asString(newStatus),
      req.user,
      asString(comment) || "",
    );
    return res.json({ success: true, report });
  });

  static assignOfficer = asyncHandler(async (req, res) => {
    const report = await ReportService.assignOfficerInDB(
      req.params.id,
      asString(req.body.officerId),
      req.user,
    );
    return res.json({ success: true, report });
  });

  static reassessRisk = asyncHandler(async (req, res) => {
    const count = await ReportService.reassessAllRisks(req.user);
    return res.json({ success: true, message: `${count} open reports re-scored`, count });
  });
}

export const getReports = ReportController.getReports;
export const getReportById = ReportController.getReportById;
export const createReport = ReportController.createReport;
export const updateReportStatus = ReportController.updateReportStatus;
export const assignOfficer = ReportController.assignOfficer;
export const reassessRisk = ReportController.reassessRisk;
export default ReportController;
