import InvestigationService from "../service/investigation.service.js";
import asyncHandler from "../middleware/asyncHandler.js";

class InvestigationController {
  static getInvestigations = asyncHandler(async (req, res) => {
    const { status, reportId } = req.query;
    const filter = {};
    if (status) filter.status = String(status);
    if (reportId) filter.reportId = String(reportId);

    const investigations = await InvestigationService.getInvestigationsFromDB(filter);
    return res.json({ success: true, investigations });
  });

  static createInvestigation = asyncHandler(async (req, res) => {
    const investigation = await InvestigationService.createInvestigationInDB(req.body, req.user);
    return res.status(201).json({ success: true, investigation });
  });

  static updateInvestigation = asyncHandler(async (req, res) => {
    const investigation = await InvestigationService.updateInvestigationInDB(
      req.params.id,
      req.body,
      req.user,
    );
    return res.json({ success: true, investigation });
  });

  static finalizeInvestigation = asyncHandler(async (req, res) => {
    const { report, investigation } = await InvestigationService.finalizeInvestigationInDB(
      req.params.reportId,
      req.body,
      req.user,
    );
    return res.json({ success: true, report, investigation });
  });
}

export const getInvestigations = InvestigationController.getInvestigations;
export const createInvestigation = InvestigationController.createInvestigation;
export const updateInvestigation = InvestigationController.updateInvestigation;
export const finalizeInvestigation = InvestigationController.finalizeInvestigation;
export default InvestigationController;
