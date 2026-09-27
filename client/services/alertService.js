import { dbInstance } from "../utils/axios.js";

export const alertService = {
  getAlerts: () => {
    return [...dbInstance.alerts];
  },

  acknowledgeAlert: (alertId, officer) => {
    dbInstance.acknowledgeAlert(alertId, officer);
  },

  resolveAlert: (alertId) => {
    dbInstance.resolveAlert(alertId);
  },
};

export default alertService;
