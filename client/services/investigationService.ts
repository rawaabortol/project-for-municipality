import { apiClient } from "../utils/axios";
import { toInvestigation, toReport } from "../utils/normalize";
import { Investigation, Report } from "../utils/sampleData";

export interface InvestigationPayload {
  findings?: string;
  actionsTaken?: string;
  recommendations?: string;
  result?: Investigation["result"];
  samplesCollected?: string;
  notes?: string;
  status?: Investigation["status"];
}

export const investigationService = {
  getInvestigations: async (): Promise<Investigation[]> => {
    const { data } = await apiClient.get("/investigations");
    return data.investigations.map(toInvestigation);
  },

  /** Opens an investigation (report VERIFIED -> IN_INVESTIGATION) or updates the open draft. */
  saveInvestigation: async (reportId: string, payload: InvestigationPayload): Promise<Investigation> => {
    const { data } = await apiClient.post("/investigations", { reportId, ...payload });
    return toInvestigation(data.investigation);
  },

  updateInvestigation: async (id: string, updates: InvestigationPayload): Promise<Investigation> => {
    const { data } = await apiClient.put(`/investigations/${id}`, updates);
    return toInvestigation(data.investigation);
  },

  /** Completes the investigation and moves the report IN_INVESTIGATION -> RESOLVED. */
  finalize: async (
    reportId: string,
    closingData: InvestigationPayload,
  ): Promise<{ report: Report; investigation: Investigation }> => {
    const { data } = await apiClient.post(`/investigations/report/${reportId}/finalize`, closingData);
    return { report: toReport(data.report), investigation: toInvestigation(data.investigation) };
  },
};

export default investigationService;
