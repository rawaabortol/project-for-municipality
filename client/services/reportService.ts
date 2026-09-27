import { apiClient } from "../utils/axios";
import { toReport } from "../utils/normalize";
import { Report, ReportStatus, RiskLevel } from "../utils/sampleData";

export interface NewReportPayload {
  category: { name: string; code: string };
  title: string;
  description: string;
  incidentDate?: string;
  location: { address: string; district: string; lat: number; lng: number };
  affectedCount: number;
  initialSeverity: RiskLevel;
  imageUrl?: string;
  additionalComments?: string;
}

export const reportService = {
  /** Staff receive all reports; citizens only their own (enforced server-side). */
  getReports: async (params: Record<string, string | number> = {}): Promise<Report[]> => {
    const { data } = await apiClient.get("/reports", { params: { limit: 500, ...params } });
    return data.reports.map(toReport);
  },

  getReportById: async (id: string): Promise<Report> => {
    const { data } = await apiClient.get(`/reports/${id}`);
    return toReport(data.report);
  },

  createReport: async (payload: NewReportPayload): Promise<Report> => {
    const { data } = await apiClient.post("/reports", payload);
    return toReport(data.report);
  },

  updateStatus: async (reportId: string, newStatus: ReportStatus, comment = ""): Promise<Report> => {
    const { data } = await apiClient.put(`/reports/${reportId}/status`, { newStatus, comment });
    return toReport(data.report);
  },

  assignOfficer: async (reportId: string, officerId: string): Promise<Report> => {
    const { data } = await apiClient.put(`/reports/${reportId}/assign`, { officerId });
    return toReport(data.report);
  },

  reassessAllRisks: async (): Promise<number> => {
    const { data } = await apiClient.post("/reports/reassess-risk");
    return data.count;
  },
};

export default reportService;
