import { getAlertsFromDB, acknowledgeAlertInDB, resolveAlertInDB } from '../service/alertService.js';

export const getAlerts = async (req, res) => {
  try {
    const { status, riskLevel } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;

    const alerts = await getAlertsFromDB(filter);
    return res.json({ success: true, alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await acknowledgeAlertInDB(id, req.user);
    return res.json({ success: true, message: `Alert acknowledged`, alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await resolveAlertInDB(id);
    return res.json({ success: true, message: `Alert marked as resolved`, alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
