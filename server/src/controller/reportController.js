import { calculateReportRisk } from '../service/riskEngine.js';
import { REPORT_STATUSES } from '../constant/index.js';

export const getReports = async (req, res) => {
  try {
    // Return filtered or paginated reports
    return res.json({ success: true, count: 0, reports: [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const reportData = req.body;
    const riskAssessment = calculateReportRisk(reportData, []);

    const newReport = {
      ...reportData,
      reportNumber: `TRP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      riskFactors: riskAssessment.factors,
      status: REPORT_STATUSES.SUBMITTED,
      statusHistory: [
        {
          oldStatus: 'NONE',
          newStatus: REPORT_STATUSES.SUBMITTED,
          changedBy: {
            name: req.user?.name || reportData.citizen?.name || 'Citizen Reporter',
            role: req.user?.role || 'CITIZEN'
          },
          timestamp: new Date().toISOString(),
          comment: 'Initial incident report submitted by citizen via portal.'
        }
      ],
      createdAt: new Date().toISOString()
    };

    return res.status(201).json({ success: true, report: newReport });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus, comment } = req.body;

    return res.json({
      success: true,
      message: `Report ${id} status transitioned to ${newStatus}`,
      historyEntry: {
        oldStatus: 'UNDER_REVIEW',
        newStatus,
        changedBy: req.user?.name || 'Health Officer',
        timestamp: new Date().toISOString(),
        comment: comment || ''
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
