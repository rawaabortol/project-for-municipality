import { dbInstance } from '../utils/axios';

export const dashboardService = {
  getStats: () => {
    const reports = dbInstance.reports;
    const now = Date.now();
    const oneDayAgo = now - 24 * 3600 * 1000;
    const oneWeekAgo = now - 7 * 24 * 3600 * 1000;
    const oneMonthAgo = now - 30 * 24 * 3600 * 1000;

    const reportsToday = reports.filter(r => new Date(r.createdAt).getTime() >= oneDayAgo).length;
    const reportsThisWeek = reports.filter(r => new Date(r.createdAt).getTime() >= oneWeekAgo).length;
    const reportsThisMonth = reports.filter(r => new Date(r.createdAt).getTime() >= oneMonthAgo).length;

    const criticalCount = reports.filter(r => r.riskLevel === 'CRITICAL').length;
    const highCount = reports.filter(r => r.riskLevel === 'HIGH').length;
    const underInvestigationCount = reports.filter(r => r.status === 'IN_INVESTIGATION').length;
    const resolvedCount = reports.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;
    const activeAlerts = dbInstance.alerts.filter(a => a.status === 'ACTIVE').length;
    const activeClusters = dbInstance.clusters.filter(c => c.status === 'ACTIVE').length;

    // By Category
    const categoryCounts: { [key: string]: number } = {};
    reports.forEach(r => {
      const name = r.category.name;
      categoryCounts[name] = (categoryCounts[name] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // By Status
    const statusCounts: { [key: string]: number } = {};
    reports.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });
    const statusData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    // By District
    const districtCounts: { [key: string]: number } = {};
    reports.forEach(r => {
      const d = r.location.district || 'Tripoli';
      districtCounts[d] = (districtCounts[d] || 0) + 1;
    });
    const districtData = Object.entries(districtCounts)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count);

    // Risk distribution
    const riskCounts = {
      CRITICAL: criticalCount,
      HIGH: highCount,
      MEDIUM: reports.filter(r => r.riskLevel === 'MEDIUM').length,
      LOW: reports.filter(r => r.riskLevel === 'LOW').length
    };
    const riskData = Object.entries(riskCounts).map(([level, count]) => ({ level, count }));

    const resolutionRate = reports.length > 0 ? Math.round((resolvedCount / reports.length) * 100) : 0;

    return {
      totalReports: reports.length,
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      criticalCount,
      highCount,
      underInvestigationCount,
      resolvedCount,
      activeAlerts,
      activeClusters,
      resolutionRate,
      categoryData,
      statusData,
      districtData,
      riskData
    };
  }
};
