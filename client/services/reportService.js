import ReportModel from '../../server/src/models/Report.js';
import CategoryModel from '../../server/src/models/Category.js';
import RiskAssessmentModel from '../../server/src/models/RiskAssessment.js';
import { calculateReportRisk } from '../../server/src/service/riskEngine.js';
import { dbInstance } from '../utils/axios.js';

export const reportService = {
  model: ReportModel,
  categoryModel: CategoryModel,
  riskModel: RiskAssessmentModel,

  getReports: () => {
    return [...dbInstance.reports];
  },

  getReportById: (id) => {
    return dbInstance.reports.find(r => r.id === id || r.reportNumber === id || r._id === id);
  },

  getCitizenReports: (userId) => {
    return dbInstance.reports.filter(r => r.citizen?.userId === userId);
  },

  createReport: (reportData, currentUser) => {
    const risk = calculateReportRisk(reportData, dbInstance.reports);
    const count = dbInstance.reports.length;
    const reportNumber = `TRP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const newReport = {
      id: `rep_${Date.now()}`,
      reportNumber,
      citizen: {
        userId: currentUser?.id || currentUser?._id || 'anonymous',
        name: currentUser?.name || reportData.citizen?.name || 'Citizen Reporter',
        phone: currentUser?.phone || reportData.citizen?.phone || '',
        email: currentUser?.email || reportData.citizen?.email || ''
      },
      category: typeof reportData.category === 'object' ? reportData.category : {
        name: reportData.category || 'General Sanitary',
        code: 'SAN-GEN'
      },
      title: reportData.title,
      description: reportData.description,
      incidentDate: reportData.incidentDate || new Date().toISOString(),
      location: {
        district: reportData.location?.district || 'Al-Tal',
        streetAddress: reportData.location?.streetAddress || reportData.location?.address || 'Tripoli',
        lat: Number(reportData.location?.lat) || 34.4367,
        lng: Number(reportData.location?.lng) || 35.8497
      },
      affectedCount: Number(reportData.affectedCount) || 1,
      initialSeverity: reportData.initialSeverity || reportData.severity || 'MEDIUM',
      status: 'SUBMITTED',
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      riskFactors: risk.factors,
      images: reportData.images || [],
      statusHistory: [
        {
          oldStatus: 'NONE',
          newStatus: 'SUBMITTED',
          changedBy: {
            userId: currentUser?.id || currentUser?._id || 'anonymous',
            name: currentUser?.name || 'Citizen Reporter',
            role: currentUser?.role || 'CITIZEN'
          },
          timestamp: new Date().toISOString(),
          comment: 'Initial incident report submitted into municipal surveillance.'
        }
      ],
      createdAt: new Date().toISOString()
    };

    return dbInstance.addReport(newReport, currentUser);
  },

  updateStatus: (reportId, newStatus, comment, user) => {
    return dbInstance.updateReportStatus(reportId, newStatus, comment, user);
  },

  assignOfficer: (reportId, officer, user) => {
    return dbInstance.assignOfficer(reportId, officer, user);
  }
};

export default reportService;
