export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateReportRisk(
  reportData: any,
  existingReports: any[] = [],
) {
  const explanations: string[] = [];

  let severityScore = 10;
  const severity = (
    reportData.initialSeverity ||
    reportData.severity ||
    "MEDIUM"
  ).toUpperCase();
  if (severity === "CRITICAL") {
    severityScore = 25;
    explanations.push("Critical severity indicator flagged (+25 pts)");
  } else if (severity === "HIGH") {
    severityScore = 18;
    explanations.push("High initial severity rating (+18 pts)");
  } else if (severity === "MEDIUM") {
    severityScore = 10;
    explanations.push("Moderate severity profile (+10 pts)");
  } else {
    severityScore = 4;
    explanations.push("Low initial severity profile (+4 pts)");
  }

  const affected = Number(reportData.affectedCount || 1);
  let affectedPeopleScore = 5;
  if (affected >= 50) {
    affectedPeopleScore = 25;
    explanations.push(
      `Mass exposure: ${affected} individuals affected (+25 pts)`,
    );
  } else if (affected >= 20) {
    affectedPeopleScore = 20;
    explanations.push(
      `Significant population impact: ${affected} people (+20 pts)`,
    );
  } else if (affected >= 10) {
    affectedPeopleScore = 15;
    explanations.push(`Cluster exposure: ${affected} people (+15 pts)`);
  } else if (affected >= 4) {
    affectedPeopleScore = 10;
    explanations.push(
      `Multiple individuals affected: ${affected} people (+10 pts)`,
    );
  } else {
    affectedPeopleScore = 5;
    explanations.push(`Localized impact: ${affected} person(s) (+5 pts)`);
  }

  const now = Date.now();
  const reportTime = reportData.incidentDate
    ? new Date(reportData.incidentDate).getTime()
    : now;
  const diffHours = Math.max(0, (now - reportTime) / (1000 * 60 * 60));
  let recentReportsScore = 2;
  if (diffHours <= 6) {
    recentReportsScore = 15;
    explanations.push(
      `Immediate/fresh incident: reported within last ${Math.round(diffHours)}h (+15 pts)`,
    );
  } else if (diffHours <= 24) {
    recentReportsScore = 10;
    explanations.push("Recent incident within last 24h (+10 pts)");
  } else if (diffHours <= 72) {
    recentReportsScore = 5;
    explanations.push("Reported within past 72h (+5 pts)");
  } else {
    recentReportsScore = 2;
    explanations.push("Historical or delayed incident log (+2 pts)");
  }

  const categoryName =
    (typeof reportData.category === "object"
      ? reportData.category?.name
      : reportData.category) || "";
  const catLower = categoryName.toLowerCase();
  let categoryScore = 8;
  if (catLower.includes("water") || catLower.includes("drinking")) {
    categoryScore = 15;
    explanations.push(
      "Water/drinking source vulnerability: critical public utility hazard (+15 pts)",
    );
  } else if (
    catLower.includes("poison") ||
    catLower.includes("outbreak") ||
    catLower.includes("disease")
  ) {
    categoryScore = 14;
    explanations.push(
      "Suspected infectious outbreak or toxicity threat (+14 pts)",
    );
  } else if (catLower.includes("sewage")) {
    categoryScore = 12;
    explanations.push(
      "Sewage line breakdown / environmental contamination risk (+12 pts)",
    );
  } else if (catLower.includes("food")) {
    categoryScore = 10;
    explanations.push("Commercial food hygiene threat (+10 pts)");
  } else if (
    catLower.includes("pest") ||
    catLower.includes("mosquito") ||
    catLower.includes("rodent")
  ) {
    categoryScore = 9;
    explanations.push("Vector pest propagation hazard (+9 pts)");
  } else {
    categoryScore = 6;
    explanations.push("General municipal sanitary hazard (+6 pts)");
  }

  let geographicClusterScore = 0;
  const targetLat = reportData.location?.lat;
  const targetLng = reportData.location?.lng;

  if (
    targetLat &&
    targetLng &&
    Array.isArray(existingReports) &&
    existingReports.length > 0
  ) {
    const nearbySameCategory = existingReports.filter((r: any) => {
      if (r._id && reportData._id && String(r._id) === String(reportData._id))
        return false;
      const rCategory =
        (typeof r.category === "object" ? r.category?.name : r.category) || "";
      if (rCategory.toLowerCase() !== catLower) return false;
      const rLat = r.location?.lat;
      const rLng = r.location?.lng;
      if (!rLat || !rLng) return false;
      const dist = calculateHaversineDistanceKm(
        targetLat,
        targetLng,
        rLat,
        rLng,
      );
      return dist <= 1.5;
    });

    const nearbyCount = nearbySameCategory.length;
    if (nearbyCount >= 5) {
      geographicClusterScore = 20;
      explanations.push(
        `High spatial density: ${nearbyCount} nearby reports within 1.5km (+20 pts)`,
      );
    } else if (nearbyCount >= 3) {
      geographicClusterScore = 14;
      explanations.push(
        `Moderate spatial concentration: ${nearbyCount} nearby reports within 1.5km (+14 pts)`,
      );
    } else if (nearbyCount >= 1) {
      geographicClusterScore = 7;
      explanations.push(
        `${nearbyCount} adjacent reports detected in the immediate area (+7 pts)`,
      );
    } else {
      geographicClusterScore = 2;
      explanations.push("Isolated geographic incident (+2 pts)");
    }
  } else {
    geographicClusterScore = 4;
    explanations.push("Baseline neighborhood density (+4 pts)");
  }

  const totalScore = Math.min(
    100,
    Math.max(
      0,
      severityScore +
        affectedPeopleScore +
        recentReportsScore +
        categoryScore +
        geographicClusterScore,
    ),
  );

  let riskLevel: RiskLevel = "LOW";
  if (totalScore >= 76) {
    riskLevel = "CRITICAL";
  } else if (totalScore >= 51) {
    riskLevel = "HIGH";
  } else if (totalScore >= 26) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "LOW";
  }

  return {
    riskScore: totalScore,
    riskLevel,
    factors: {
      severityScore,
      affectedPeopleScore,
      recentReportsScore,
      geographicClusterScore,
      categoryScore,
      explanations,
    },
  };
}
