import { apiClient } from "../utils/axios";
import { toCluster } from "../utils/normalize";
import { Cluster } from "../utils/sampleData";

export const clusterService = {
  getClusters: async (): Promise<Cluster[]> => {
    const { data } = await apiClient.get("/clusters");
    return data.clusters.map(toCluster);
  },

  /** Runs server-side spatial-temporal detection; resolves to the number of tracked clusters. */
  triggerScan: async (): Promise<number> => {
    const { data } = await apiClient.post("/clusters/detect");
    return data.clusters.length;
  },

  updateStatus: async (clusterId: string, status: Cluster["status"]): Promise<Cluster> => {
    const { data } = await apiClient.put(`/clusters/${clusterId}/status`, { status });
    return toCluster(data.cluster);
  },
};

export default clusterService;
