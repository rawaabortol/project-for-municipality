import { apiClient } from "../utils/axios";
import { DashboardStats, EMPTY_STATS } from "../utils/sampleData";

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get("/dashboard/statistics");
    return { ...EMPTY_STATS, ...data.data };
  },
};

export default dashboardService;
