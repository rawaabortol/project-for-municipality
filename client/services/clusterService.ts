import { dbInstance } from '../utils/axios';
import { Cluster } from '../utils/sampleData';

export const clusterService = {
  getClusters: (): Cluster[] => {
    return [...dbInstance.clusters];
  },

  triggerScan: (): Cluster[] => {
    return dbInstance.runClusterScan();
  }
};
