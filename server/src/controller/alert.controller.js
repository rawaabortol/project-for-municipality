import AlertService from "../service/alert.service.js";

class AlertController {
  static async getAlerts(req, res) {
    try {
      const { status, riskLevel } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (riskLevel) filter.riskLevel = riskLevel;

      const alerts = await AlertService.getAlertsFromDB(filter);
      return res.json({ success: true, alerts });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async acknowledgeAlert(req, res) {
    try {
      const { id } = req.params;
      const alert = await AlertService.acknowledgeAlertInDB(id, req.user);
      return res.json({ success: true, message: "Alert acknowledged", alert });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async resolveAlert(req, res) {
    try {
      const { id } = req.params;
      const alert = await AlertService.resolveAlertInDB(id);
      return res.json({
        success: true,
        message: "Alert marked as resolved",
        alert,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const getAlerts = AlertController.getAlerts;
export const acknowledgeAlert = AlertController.acknowledgeAlert;
export const resolveAlert = AlertController.resolveAlert;
export default AlertController;
