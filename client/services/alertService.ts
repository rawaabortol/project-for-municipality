import { dbInstance } from "../utils/axios";
import { Alert } from "../utils/sampleData";

/**
 * Browser-safe alert service.
 */
export const alertService = {
  getAlerts: (): Alert[] => {
    return [...dbInstance.alerts];
  },

  acknowledgeAlert: (alertId: string, officer: any): void => {
    dbInstance.acknowledgeAlert(alertId, officer);
  },

  resolveAlert: (alertId: string): void => {
    dbInstance.resolveAlert(alertId);
  },
};

export default alertService;
