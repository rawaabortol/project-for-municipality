import ReportService from "../service/report.service.js";

class ReportController {
  static async getReports(req, res) {
    try {
      const { status, district, riskLevel, category, page, limit } = req.query;
      const result = await ReportService.getReportsFromDB(
        { status, district, riskLevel, category },
        { page: Number(page) || 1, limit: Number(limit) || 50 },
      );
      return res.json({ success: true, ...result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createReport(req, res) {
    try {
      const reportData = req.body;
      const newReport = await ReportService.createReportInDB(
        reportData,
        req.user,
      );
      return res.status(201).json({ success: true, report: newReport });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateReportStatus(req, res) {
    try {
      const { id } = req.params;
      const { newStatus, comment } = req.body;
      const updated = await ReportService.updateReportStatusInDB(
        id,
        newStatus,
        req.user,
        comment,
      );
      return res.json({ success: true, report: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const getReports = ReportController.getReports;
export const createReport = ReportController.createReport;
export const updateReportStatus = ReportController.updateReportStatus;
export default ReportController;
