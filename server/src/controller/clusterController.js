import { getActiveClustersFromDB, runClusterDetectionAndPersist } from '../service/clusterDetectionService.js';

export const getClusters = async (req, res) => {
  try {
    const clusters = await getActiveClustersFromDB();
    return res.json({ success: true, clusters });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const triggerClusterDetection = async (req, res) => {
  try {
    const detectedClusters = await runClusterDetectionAndPersist();
    return res.json({
      success: true,
      message: `Cluster detection completed. ${detectedClusters.length} active spatial clusters tracked.`,
      clusters: detectedClusters
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
