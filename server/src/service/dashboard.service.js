import Report from "../models/Report.js";
import Cluster from "../models/Cluster.js";
import Alert from "../models/Alert.js";
import Investigation from "../models/Investigation.js";
import { RISK_LEVELS, REPORT_STATUSES } from "../constant/index.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const countBy = (field) => [
  { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  { $sort: { count: -1 } },
];

class DashboardService {
  static async getDashboardStatistics() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const now = Date.now();

    const [
      totalReports,
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      activeClusters,
      activeAlerts,
      totalInvestigations,
      breakdowns,
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ createdAt: { $gte: startOfToday } }),
      Report.countDocuments({ createdAt: { $gte: new Date(now - 7 * DAY_MS) } }),
      Report.countDocuments({ createdAt: { $gte: new Date(now - 30 * DAY_MS) } }),
      Cluster.countDocuments({ status: "ACTIVE" }),
      Alert.countDocuments({ status: "ACTIVE" }),
      Investigation.countDocuments(),
      Report.aggregate([
        {
          $facet: {
            byCategory: countBy("category.name"),
            byStatus: countBy("status"),
            byDistrict: countBy("location.district"),
            byRisk: countBy("riskLevel"),
          },
        },
      ]),
    ]);

    const { byCategory, byStatus, byDistrict, byRisk } = breakdowns[0];
    const statusCount = (status) => byStatus.find((s) => s._id === status)?.count || 0;
    const riskCount = (level) => byRisk.find((r) => r._id === level)?.count || 0;

    const resolvedCount = statusCount(REPORT_STATUSES.RESOLVED) + statusCount(REPORT_STATUSES.CLOSED);
    const criticalCount = riskCount(RISK_LEVELS.CRITICAL);

    return {
      totalReports,
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      criticalCount,
      highCount: riskCount(RISK_LEVELS.HIGH),
      underInvestigationCount: statusCount(REPORT_STATUSES.IN_INVESTIGATION),
      resolvedCount,
      resolutionRate: totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0,
      activeAlerts,
      activeClusters,
      totalInvestigations,
      categoryData: byCategory.map((c) => ({ name: c._id || "Uncategorized", count: c.count })),
      statusData: byStatus.map((s) => ({ status: s._id, count: s.count })),
      districtData: byDistrict.map((d) => ({ district: d._id || "Tripoli", count: d.count })),
      riskData: Object.values(RISK_LEVELS)
        .reverse()
        .map((level) => ({ level, count: riskCount(level) })),
      // Backwards-compatible aliases
      todayReports: reportsToday,
      criticalReports: criticalCount,
    };
  }
}

export const getDashboardStatistics = DashboardService.getDashboardStatistics;
export default DashboardService;
