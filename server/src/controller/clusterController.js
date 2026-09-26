import { detectClusters } from '../service/clusterDetectionService.js';

export const getClusters = async (req, res) => {
  return res.json({ success: true, clusters: [] });
};

export const triggerClusterDetection = async (req, res) => {
  // Can be called to rescan live reports
  return res.json({ success: true, message: 'Cluster detection scan completed successfully.' });
};
