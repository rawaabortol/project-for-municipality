import InvestigationService from "../service/investigation.service.js";

class InvestigationController {
  static async getInvestigations(req, res) {
    try {
      const { status, reportId } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (reportId) filter.reportId = reportId;

      const investigations =
        await InvestigationService.getInvestigationsFromDB(filter);
      return res.json({ success: true, investigations });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createInvestigation(req, res) {
    try {
      const investigation = await InvestigationService.createInvestigationInDB(
        req.body,
        req.user,
      );
      return res.status(201).json({ success: true, investigation });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateInvestigation(req, res) {
    try {
      const { id } = req.params;
      const updated = await InvestigationService.updateInvestigationInDB(
        id,
        req.body,
        req.user,
      );
      return res.json({ success: true, investigation: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const getInvestigations = InvestigationController.getInvestigations;
export const createInvestigation = InvestigationController.createInvestigation;
export const updateInvestigation = InvestigationController.updateInvestigation;
export default InvestigationController;
