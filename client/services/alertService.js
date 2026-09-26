import AlertModel from '../../server/src/models/Alert.js';
import ClusterModel from '../../server/src/models/Cluster.js';
import ReportModel from '../../server/src/models/Report.js';
import NotificationModel from '../../server/src/models/Notification.js';
import { dbInstance } from '../utils/axios.js';

export const alertService = {
  model: AlertModel,
  clusterModel: ClusterModel,
  reportModel: ReportModel,
  notificationModel: NotificationModel,

  getAlerts: () => {
    return [...dbInstance.alerts];
  },

  acknowledgeAlert: (alertId, officer) => {
    dbInstance.acknowledgeAlert(alertId, officer);
  },

  resolveAlert: (alertId) => {
    dbInstance.resolveAlert(alertId);
  }
};

export default alertService;
