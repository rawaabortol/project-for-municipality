export const getStatistics = async (req, res) => {
  return res.json({
    success: true,
    data: {
      totalReports: 0,
      todayReports: 0,
      criticalReports: 0,
      activeClusters: 0,
      resolvedCount: 0
    }
  });
};
