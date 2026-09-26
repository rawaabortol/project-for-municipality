export const getAlerts = async (req, res) => {
  return res.json({ success: true, alerts: [] });
};

export const acknowledgeAlert = async (req, res) => {
  const { id } = req.params;
  return res.json({ success: true, message: `Alert ${id} acknowledged by officer.` });
};

export const resolveAlert = async (req, res) => {
  const { id } = req.params;
  return res.json({ success: true, message: `Alert ${id} marked as resolved.` });
};
