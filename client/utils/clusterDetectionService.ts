import { calculateHaversineDistanceKm } from "./riskEngine";

export function detectClusters(reports: any[] = []) {
  const clustersFound: any[] = [];
  const validReports = reports.filter(
    (r) =>
      r.location?.lat &&
      r.location?.lng &&
      r.status !== "REJECTED" &&
      r.status !== "CLOSED",
  );

  const categoryGroups: Record<string, string[]> = {
    "Water Contamination": ["Water Contamination", "Unsafe Drinking Water"],
    "Foodborne Illness": ["Food Safety", "Suspected Food Poisoning"],
    "Sewage & Sanitary": ["Sewage Problem", "Garbage Accumulation"],
    "Disease Outbreak": ["Suspected Disease/Outbreak"],
    "Vector Infestation": ["Mosquito Infestation", "Rodent/Pest Problem"],
    Environmental: ["Air Pollution", "Environmental Hazard"],
  };

  const processedReportIds = new Set<string>();

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
        const timeDiffHours = Math.abs(candTime - baseTime) / (1000 * 60 * 60);

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
        const districtCount: Record<string, number> = {};
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
          hasCritical || clusterMembers.length >= 5 ? "CRITICAL" : "HIGH";
        const clusterCode = `CLS-${(primaryDistrict || "TRP")
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
