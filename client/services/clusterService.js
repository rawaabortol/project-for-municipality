import ClusterModel from '../../server/src/models/Cluster.js';
import ReportModel from '../../server/src/models/Report.js';
import AlertModel from '../../server/src/models/Alert.js';
import { dbInstance } from '../utils/axios.js';

export const clusterService = {
  model: ClusterModel,
  reportModel: ReportModel,
  alertModel: AlertModel,

  getClusters: () => {
    return [...dbInstance.clusters];
  },

  triggerScan: () => {
    return dbInstance.runClusterScan();
  }
};

export default clusterService;
