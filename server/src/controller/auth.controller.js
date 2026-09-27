import AuthService from "../service/auth.service.js";
import asyncHandler from "../middleware/asyncHandler.js";

class AuthController {
  static register = asyncHandler(async (req, res) => {
    const { user, token } = await AuthService.register(req.body);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user, token },
    });
  });

  static login = asyncHandler(async (req, res) => {
    const { user, token } = await AuthService.login(req.body);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, token },
    });
  });

  static me = asyncHandler(async (req, res) => {
    return res.json({ success: true, data: { user: req.user } });
  });
}

export const register = AuthController.register;
export const login = AuthController.login;
export const me = AuthController.me;
export default AuthController;
