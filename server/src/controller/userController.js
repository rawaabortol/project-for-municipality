import { USER_ROLES } from '../constant/index.js';

export const getUsers = async (req, res) => {
  return res.json({ success: true, users: [] });
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  return res.json({ success: true, message: `User ${id} role changed to ${role}` });
};
