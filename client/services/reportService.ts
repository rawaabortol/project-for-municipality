import { dbInstance } from '../utils/axios';
import { Report } from '../utils/sampleData';

export const reportService = {
  getReports: (): Report[] => {
    return [...dbInstance.reports];
  },

  getReportById: (id: string): Report | undefined => {
    return dbInstance.reports.find(r => r.id === id || r.reportNumber === id);
  },

  getCitizenReports: (userId: string): Report[] => {
    return dbInstance.reports.filter(r => r.citizen.userId === userId);
  },

  createReport: (reportData: any, currentUser: any): Report => {
    return dbInstance.addReport(reportData, currentUser);
  },

  updateStatus: (reportId: string, newStatus: any, comment: string, user: any): Report | null => {
    return dbInstance.updateReportStatus(reportId, newStatus, comment, user);
  },

  assignOfficer: (reportId: string, officer: any, user: any): Report | null => {
    return dbInstance.assignOfficer(reportId, officer, user);
  }
};
