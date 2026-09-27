import AlertService from "../service/alert.service.js";
import asyncHandler from "../middleware/asyncHandler.js";

class AlertController {
  static getAlerts = asyncHandler(async (req, res) => {
    const { status, riskLevel } = req.query;
    const filter = {};
    if (status) filter.status = String(status);
    if (riskLevel) filter.riskLevel = String(riskLevel);

    const alerts = await AlertService.getAlertsFromDB(filter);
    return res.json({ success: true, alerts });
  });

  static acknowledgeAlert = asyncHandler(async (req, res) => {
    const alert = await AlertService.acknowledgeAlertInDB(req.params.id, req.user);
    return res.json({ success: true, message: "Alert acknowledged", alert });
  });

  static resolveAlert = asyncHandler(async (req, res) => {
    const alert = await AlertService.resolveAlertInDB(req.params.id, req.user);
    return res.json({ success: true, message: "Alert marked as resolved", alert });
  });
}

export const getAlerts = AlertController.getAlerts;
export const acknowledgeAlert = AlertController.acknowledgeAlert;
export const resolveAlert = AlertController.resolveAlert;
export default AlertController;
