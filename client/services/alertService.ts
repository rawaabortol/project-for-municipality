import { apiClient } from "../utils/axios";
import { toAlert } from "../utils/normalize";
import { Alert } from "../utils/sampleData";

export const alertService = {
  getAlerts: async (): Promise<Alert[]> => {
    const { data } = await apiClient.get("/alerts");
    return data.alerts.map(toAlert);
  },

  acknowledgeAlert: async (alertId: string): Promise<void> => {
    await apiClient.put(`/alerts/${alertId}/ack`);
  },

  resolveAlert: async (alertId: string): Promise<void> => {
    await apiClient.put(`/alerts/${alertId}/resolve`);
  },
};

export default alertService;
