import ClusterDetectionService from "../service/clusterDetection.service.js";

class ClusterController {
  static async getClusters(req, res) {
    try {
      const clusters = await ClusterDetectionService.getActiveClustersFromDB();
      return res.json({ success: true, clusters });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async triggerClusterDetection(req, res) {
    try {
      const detectedClusters =
        await ClusterDetectionService.runClusterDetectionAndPersist();
      return res.json({
        success: true,
        message: `Cluster detection completed. ${detectedClusters.length} active spatial clusters tracked.`,
        clusters: detectedClusters,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const getClusters = ClusterController.getClusters;
export const triggerClusterDetection =
  ClusterController.triggerClusterDetection;
export default ClusterController;
