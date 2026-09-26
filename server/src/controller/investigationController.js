import { getInvestigationsFromDB, createInvestigationInDB, updateInvestigationInDB } from '../service/investigationService.js';

export const getInvestigations = async (req, res) => {
  try {
    const { status, reportId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (reportId) filter.reportId = reportId;

    const investigations = await getInvestigationsFromDB(filter);
    return res.json({ success: true, investigations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvestigation = async (req, res) => {
  try {
    const investigation = await createInvestigationInDB(req.body, req.user);
    return res.status(201).json({ success: true, investigation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInvestigation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateInvestigationInDB(id, req.body, req.user);
    return res.json({ success: true, investigation: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
