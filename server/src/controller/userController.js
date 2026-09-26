import User from '../models/User.js';
import { logAuditAction } from '../service/auditService.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logAuditAction({
      user: req.user,
      action: 'UPDATE_USER_ROLE',
      resource: `User ${user.email}`,
      details: `New role assigned: ${role}`
    });

    return res.json({ success: true, message: `User ${user.name} role changed to ${role}`, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
