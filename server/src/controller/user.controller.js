import UserService from "../service/user.service.js";

class UserController {
  static async getUsers(req, res) {
    try {
      const users = await UserService.getUsersFromDB();
      return res.json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await UserService.updateUserRoleInDB(id, role, req.user);
      return res.json({
        success: true,
        message: `User ${user.name} role changed to ${role}`,
        user,
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res
        .status(status)
        .json({ success: false, message: error.message });
    }
  }
}

export const getUsers = UserController.getUsers;
export const updateUserRole = UserController.updateUserRole;
export default UserController;
