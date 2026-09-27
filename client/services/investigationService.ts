import { dbInstance } from "../utils/axios";
import { Investigation } from "../utils/sampleData";

/**
 * Browser-safe investigation service.
 */
export const investigationService = {
  getInvestigations: (): Investigation[] => {
    return [...dbInstance.investigations];
  },

  getInvestigationByReportId: (reportId: string): Investigation | undefined => {
    return dbInstance.investigations.find(
      (i) => i.reportId === reportId || i.reportNumber === reportId,
    );
  },

  createInvestigation: (data: any, officer: any): Investigation => {
    return dbInstance.createInvestigation(data, officer);
  },

  updateInvestigation: (
    id: string,
    updates: Partial<Investigation>,
  ): Investigation | null => {
    const inv = dbInstance.investigations.find((i) => i.id === id);
    if (!inv) return null;
    Object.assign(inv, updates);
    dbInstance.persistAll();
    return inv;
  },
};

export default investigationService;
