import { apiClient } from "../utils/axios";
import { toAuditLog, toNotification } from "../utils/normalize";
import { AppNotification, AuditLog } from "../utils/sampleData";

export const notificationService = {
  getMine: async (): Promise<AppNotification[]> => {
    const { data } = await apiClient.get("/notifications");
    return data.notifications.map(toNotification);
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put("/notifications/read-all");
  },
};

export const auditService = {
  getLogs: async (limit = 200): Promise<AuditLog[]> => {
    const { data } = await apiClient.get("/audit-logs", { params: { limit } });
    return data.logs.map(toAuditLog);
  },
};

export default notificationService;
