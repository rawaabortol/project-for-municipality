import { dbInstance } from "../utils/axios.js";

export const investigationService = {
  getInvestigations: () => {
    return [...dbInstance.investigations];
  },

  getInvestigationByReportId: (reportId) => {
    return dbInstance.investigations.find(
      (i) => i.reportId === reportId || i.reportNumber === reportId,
    );
  },

  createInvestigation: (data, officer) => {
    return dbInstance.createInvestigation(data, officer);
  },

  updateInvestigation: (id, updates) => {
    const inv = dbInstance.investigations.find((i) => i.id === id);
    if (!inv) return null;
    Object.assign(inv, updates);
    dbInstance.persistAll();
    return inv;
  },
};

export default investigationService;
