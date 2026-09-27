import UserService from "../service/auth.service.js";
import asyncHandler from "../middleware/asyncHandler.js";

class AuthController {
  static registerRefugeeController = asyncHandler(async (req, res) => {
    const { user, token } = await UserService.register(req.body);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user, token },
    });
  });

  static async login(req, res) {
    try {
      const { user, token } = await UserService.login(req.body);
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: { user, token },
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
  }
}

export const registerRefugeeController =
  AuthController.registerRefugeeController;
export const login = AuthController.login;
export default AuthController;
