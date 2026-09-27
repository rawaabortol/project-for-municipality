import UserService from "../service/user.service.js";
import asyncHandler from "../middleware/asyncHandler.js";

class UserController {
  static getUsers = asyncHandler(async (req, res) => {
    const users = await UserService.getUsersFromDB();
    return res.json({ success: true, users });
  });

  static getOfficers = asyncHandler(async (req, res) => {
    const officers = await UserService.getOfficersFromDB();
    return res.json({ success: true, users: officers });
  });

  static createUser = asyncHandler(async (req, res) => {
    const user = await UserService.createUserInDB(req.body, req.user);
    return res.status(201).json({ success: true, user });
  });

  static updateUserRole = asyncHandler(async (req, res) => {
    const { role, badgeNumber, title } = req.body;
    const user = await UserService.updateUserRoleInDB(
      req.params.id,
      { role, badgeNumber, title },
      req.user,
    );
    return res.json({
      success: true,
      message: `User ${user.name} role changed to ${user.role}`,
      user,
    });
  });

  static updateMyProfile = asyncHandler(async (req, res) => {
    const user = await UserService.updateProfileInDB(req.user._id, req.body);
    return res.json({ success: true, user });
  });
}

export const getUsers = UserController.getUsers;
export const getOfficers = UserController.getOfficers;
export const createUser = UserController.createUser;
export const updateUserRole = UserController.updateUserRole;
export const updateMyProfile = UserController.updateMyProfile;
export default UserController;
