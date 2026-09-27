import { dbInstance } from "../utils/axios";
import { Cluster } from "../utils/sampleData";

/**
 * Browser-safe cluster service.
 */
export const clusterService = {
  getClusters: (): Cluster[] => {
    return [...dbInstance.clusters];
  },

  triggerScan: (): Cluster[] => {
    return dbInstance.runClusterScan();
  },
};

export default clusterService;
