import DashboardService from "../service/dashboard.service.js";
import asyncHandler from "../middleware/asyncHandler.js";

class DashboardController {
  static getStatistics = asyncHandler(async (req, res) => {
    const data = await DashboardService.getDashboardStatistics();
    return res.json({ success: true, data });
  });
}

export const getStatistics = DashboardController.getStatistics;
export default DashboardController;
