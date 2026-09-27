import DashboardService from "../service/dashboard.service.js";

class DashboardController {
  static async getStatistics(req, res) {
    try {
      const data = await DashboardService.getDashboardStatistics();
      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const getStatistics = DashboardController.getStatistics;
export default DashboardController;
