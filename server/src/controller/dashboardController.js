import Report from '../models/Report.js';
import Cluster from '../models/Cluster.js';
import Alert from '../models/Alert.js';
import Investigation from '../models/Investigation.js';
import { RISK_LEVELS } from '../constant/index.js';

export const getStatistics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalReports,
      todayReports,
      criticalReports,
      activeClusters,
      activeAlerts,
      totalInvestigations,
      resolvedCount
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ createdAt: { $gte: today } }),
      Report.countDocuments({ riskLevel: RISK_LEVELS.CRITICAL }),
      Cluster.countDocuments({ status: 'ACTIVE' }),
      Alert.countDocuments({ status: 'ACTIVE' }),
      Investigation.countDocuments(),
      Report.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } })
    ]);

    return res.json({
      success: true,
      data: {
        totalReports,
        todayReports,
        criticalReports,
        activeClusters,
        activeAlerts,
        totalInvestigations,
        resolvedCount
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
