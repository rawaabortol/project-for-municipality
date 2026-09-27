import { dbInstance } from "../utils/axios.js";

export const clusterService = {
  getClusters: () => {
    return [...dbInstance.clusters];
  },

  triggerScan: () => {
    return dbInstance.runClusterScan();
  },
};

export default clusterService;
