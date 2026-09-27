import User from "../models/User.js";
import { logAuditAction } from "./auditService.js";

class UserService {
  static async getUsersFromDB() {
    return User.find().select("-password").sort({ createdAt: -1 }).lean();
  }

  static async updateUserRoleInDB(id, role, actor) {
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    ).select("-password");
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    await logAuditAction({
      user: actor,
      action: "UPDATE_USER_ROLE",
      resource: `User ${user.email}`,
      details: `New role assigned: ${role}`,
    });

    return user;
  }
}

export const getUsersFromDB = UserService.getUsersFromDB;
export const updateUserRoleInDB = UserService.updateUserRoleInDB;
export default UserService;
