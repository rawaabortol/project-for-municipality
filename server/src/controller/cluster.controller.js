import ClusterDetectionService from "../service/clusterDetection.service.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { logAuditAction } from "../service/auditService.js";

class ClusterController {
  static getClusters = asyncHandler(async (req, res) => {
    const clusters = await ClusterDetectionService.getActiveClustersFromDB();
    return res.json({ success: true, clusters });
  });

  static triggerClusterDetection = asyncHandler(async (req, res) => {
    const detectedClusters = await ClusterDetectionService.runClusterDetectionAndPersist();
    await logAuditAction({
      user: req.user,
      action: "RUN_CLUSTER_SCAN",
      resource: "Cluster Detection Engine",
      details: `${detectedClusters.length} active spatial clusters tracked`,
    });
    return res.json({
      success: true,
      message: `Cluster detection completed. ${detectedClusters.length} active spatial clusters tracked.`,
      clusters: detectedClusters,
    });
  });

  static updateClusterStatus = asyncHandler(async (req, res) => {
    const cluster = await ClusterDetectionService.updateClusterStatusInDB(
      req.params.id,
      String(req.body.status),
    );
    await logAuditAction({
      user: req.user,
      action: "UPDATE_CLUSTER_STATUS",
      resource: `Cluster ${cluster.clusterCode}`,
      details: `New status: ${cluster.status}`,
    });
    return res.json({ success: true, cluster });
  });
}

export const getClusters = ClusterController.getClusters;
export const triggerClusterDetection = ClusterController.triggerClusterDetection;
export const updateClusterStatus = ClusterController.updateClusterStatus;
export default ClusterController;
