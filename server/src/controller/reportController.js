import { getReportsFromDB, createReportInDB, updateReportStatusInDB } from '../service/reportService.js';
import Report from '../models/Report.js';

export const getReports = async (req, res) => {
  try {
    const { status, district, riskLevel, category, page, limit } = req.query;
    const result = await getReportsFromDB(
      { status, district, riskLevel, category },
      { page: Number(page) || 1, limit: Number(limit) || 50 }
    );
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const reportData = req.body;
    const newReport = await createReportInDB(reportData, req.user);
    return res.status(201).json({ success: true, report: newReport });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus, comment } = req.body;
    const updated = await updateReportStatusInDB(id, newStatus, req.user, comment);
    return res.json({ success: true, report: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
