import { INVESTIGATION_RESULTS, INVESTIGATION_STATUSES } from '../constant/index.js';

export const getInvestigations = async (req, res) => {
  return res.json({ success: true, investigations: [] });
};

export const createInvestigation = async (req, res) => {
  const { reportId, reportNumber, findings, actionsTaken, recommendations, result, samplesCollected, notes } = req.body;
  const investigation = {
    id: `INV-${Date.now()}`,
    investigationCode: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    reportId,
    reportNumber,
    officer: {
      userId: req.user?.id || 'usr-officer-1',
      name: req.user?.name || 'Dr. Tariq Al-Hajj',
      badgeNumber: req.user?.badgeNumber || 'TRP-OFF-01'
    },
    investigationDate: new Date().toISOString(),
    findings,
    actionsTaken,
    recommendations,
    result: result || INVESTIGATION_RESULTS.INCONCLUSIVE,
    samplesCollected: samplesCollected || 'None',
    notes: notes || '',
    status: INVESTIGATION_STATUSES.IN_PROGRESS,
    createdAt: new Date().toISOString()
  };
  return res.status(201).json({ success: true, investigation });
};

export const updateInvestigation = async (req, res) => {
  const { id } = req.params;
  return res.json({ success: true, message: `Investigation ${id} updated`, data: req.body });
};
