import InvestigationModel from '../../server/src/models/Investigation.js';
import ReportModel from '../../server/src/models/Report.js';
import { dbInstance } from '../utils/axios.js';

export const investigationService = {
  model: InvestigationModel,
  reportModel: ReportModel,

  getInvestigations: () => {
    return [...dbInstance.investigations];
  },

  getInvestigationByReportId: (reportId) => {
    return dbInstance.investigations.find(i => i.reportId === reportId || i.reportNumber === reportId);
  },

  createInvestigation: (data, officer) => {
    return dbInstance.createInvestigation(data, officer);
  },

  updateInvestigation: (id, updates) => {
    const inv = dbInstance.investigations.find(i => i.id === id);
    if (!inv) return null;
    Object.assign(inv, updates);
    dbInstance.persistAll();
    return inv;
  }
};

export default investigationService;
