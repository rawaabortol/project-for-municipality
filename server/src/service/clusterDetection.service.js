import { calculateHaversineDistanceKm } from "./riskEngine.js";
import { RISK_LEVELS, ALERT_TYPES } from "../constant/index.js";
import Cluster from "../models/Cluster.js";
import Report from "../models/Report.js";
import Alert from "../models/Alert.js";

class ClusterDetectionService {
  static detectClusters(reports = []) {
    const clustersFound = [];
    const validReports = reports.filter(
      (r) =>
        r.location?.lat &&
        r.location?.lng &&
        r.status !== "REJECTED" &&
        r.status !== "CLOSED",
    );

    const categoryGroups = {
      "Water Contamination": ["Water Contamination", "Unsafe Drinking Water"],
      "Foodborne Illness": ["Food Safety", "Suspected Food Poisoning"],
      "Sewage & Sanitary": ["Sewage Problem", "Garbage Accumulation"],
      "Disease Outbreak": ["Suspected Disease/Outbreak"],
      "Vector Infestation": ["Mosquito Infestation", "Rodent/Pest Problem"],
      Environmental: ["Air Pollution", "Environmental Hazard"],
    };

    const processedReportIds = new Set();

    for (const [groupName, catList] of Object.entries(categoryGroups)) {
      const groupReports = validReports.filter((r) => {
        const catName =
          typeof r.category === "object" ? r.category?.name : r.category;
        return catList.some((c) =>
          (catName || "").toLowerCase().includes(c.toLowerCase()),
        );
      });

      for (let i = 0; i < groupReports.length; i++) {
        const base = groupReports[i];
        const baseId = String(base._id || base.id);
        if (processedReportIds.has(baseId)) continue;

        const clusterMembers = [base];
        const baseLat = base.location.lat;
        const baseLng = base.location.lng;
        const baseTime = new Date(
          base.incidentDate || base.createdAt || Date.now(),
        ).getTime();

        for (let j = 0; j < groupReports.length; j++) {
          if (i === j) continue;
          const candidate = groupReports[j];
          const candId = String(candidate._id || candidate.id);
          if (processedReportIds.has(candId)) continue;

          const candLat = candidate.location.lat;
          const candLng = candidate.location.lng;
          const candTime = new Date(
            candidate.incidentDate || candidate.createdAt || Date.now(),
          ).getTime();

          const distanceKm = calculateHaversineDistanceKm(
            baseLat,
            baseLng,
            candLat,
            candLng,
          );
          const timeDiffHours =
            Math.abs(candTime - baseTime) / (1000 * 60 * 60);

          if (distanceKm <= 1.2 && timeDiffHours <= 72) {
            clusterMembers.push(candidate);
          }
        }

        if (clusterMembers.length >= 3) {
          clusterMembers.forEach((m) =>
            processedReportIds.add(String(m._id || m.id)),
          );

          const avgLat =
            clusterMembers.reduce((sum, r) => sum + r.location.lat, 0) /
            clusterMembers.length;
          const avgLng =
            clusterMembers.reduce((sum, r) => sum + r.location.lng, 0) /
            clusterMembers.length;
          const totalAffected = clusterMembers.reduce(
            (sum, r) => sum + (Number(r.affectedCount) || 1),
            0,
          );

          const districts = clusterMembers.map(
            (r) => r.location.district || "Tripoli",
          );
          const districtCount = {};
          districts.forEach((d) => {
            districtCount[d] = (districtCount[d] || 0) + 1;
          });
          const primaryDistrict = Object.keys(districtCount).sort(
            (a, b) => districtCount[b] - districtCount[a],
          )[0];

          const hasCritical = clusterMembers.some(
            (r) => r.riskLevel === "CRITICAL" || r.riskScore >= 76,
          );
          const clusterRisk =
            hasCritical || clusterMembers.length >= 5
              ? RISK_LEVELS.CRITICAL
              : RISK_LEVELS.HIGH;

          const clusterCode = `CLS-${primaryDistrict
            .replace(/[^a-zA-Z]/g, "")
            .slice(0, 3)
            .toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

          clustersFound.push({
            clusterCode,
            categoryName: groupName,
            district: primaryDistrict,
            centroid: {
              lat: Number(avgLat.toFixed(5)),
              lng: Number(avgLng.toFixed(5)),
            },
            radiusMeters: 900,
            reportIds: clusterMembers.map((m) => m._id || m.id),
            reportNumbers: clusterMembers.map((m) => m.reportNumber),
            reportCount: clusterMembers.length,
            totalAffected,
            riskLevel: clusterRisk,
            timeWindowHours: 72,
            detectedAt: new Date().toISOString(),
            status: "ACTIVE",
          });
        }
      }
    }

    return clustersFound;
  }

  static async runClusterDetectionAndPersist() {
    try {
      const activeReports = await Report.find({
        status: { $nin: ["REJECTED", "CLOSED"] },
      }).lean();

      if (!activeReports.length) {
        return [];
      }

      const detected = this.detectClusters(activeReports);
      const savedClusters = [];

      for (const clusterData of detected) {
        const existing = await Cluster.findOne({
          categoryName: clusterData.categoryName,
          district: clusterData.district,
          status: { $in: ["ACTIVE", "INVESTIGATING"] },
        });

        let savedCluster;
        if (existing) {
          existing.reportIds = clusterData.reportIds;
          existing.reportCount = clusterData.reportCount;
          existing.totalAffected = clusterData.totalAffected;
          existing.centroid = clusterData.centroid;
          existing.riskLevel = clusterData.riskLevel;
          savedCluster = await existing.save();
        } else {
          savedCluster = await Cluster.create({
            clusterCode: clusterData.clusterCode,
            categoryName: clusterData.categoryName,
            district: clusterData.district,
            centroid: clusterData.centroid,
            radiusMeters: clusterData.radiusMeters,
            reportIds: clusterData.reportIds,
            reportCount: clusterData.reportCount,
            totalAffected: clusterData.totalAffected,
            riskLevel: clusterData.riskLevel,
            timeWindowHours: clusterData.timeWindowHours,
            detectedAt: new Date(),
            status: "ACTIVE",
          });

          await Alert.create({
            alertCode: `ALT-${savedCluster.clusterCode}`,
            alertType: ALERT_TYPES.CLUSTER_DETECTED,
            title: `EPIDEMIOLOGICAL CLUSTER: ${savedCluster.categoryName}`,
            description: `Spike of ${savedCluster.reportCount} related reports detected in ${savedCluster.district} impacting ~${savedCluster.totalAffected} citizens. Outbreak protocol initiated.`,
            relatedClusterId: savedCluster._id,
            riskLevel: savedCluster.riskLevel,
            area: savedCluster.district,
            status: "ACTIVE",
          });
        }

        savedClusters.push(savedCluster);
      }

      return savedClusters;
    } catch (error) {
      console.error("Error running cluster detection with Mongoose:", error);
      throw error;
    }
  }

  static async getActiveClustersFromDB() {
    return Cluster.find({ status: { $in: ["ACTIVE", "INVESTIGATING"] } })
      .populate("reportIds")
      .sort({ updatedAt: -1 })
      .lean();
  }

  static async updateClusterStatusInDB(clusterId, status) {
    return Cluster.findByIdAndUpdate(
      clusterId,
      { status },
      { new: true },
    ).populate("reportIds");
  }
}

export const detectClusters = ClusterDetectionService.detectClusters;
export const runClusterDetectionAndPersist =
  ClusterDetectionService.runClusterDetectionAndPersist;
export const getActiveClustersFromDB =
  ClusterDetectionService.getActiveClustersFromDB;
export const updateClusterStatusInDB =
  ClusterDetectionService.updateClusterStatusInDB;
export default ClusterDetectionService;
