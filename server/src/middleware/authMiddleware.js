import { USER_ROLES } from "../constant/index.js";

/**
 * Authentication Middleware
 * Extracts bearer token or user session
 */
import jwt from "jsonwebtoken";

export const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Authentication required. No bearer token provided.",
      });
  }

  // Support both "Bearer <token>" and plain token in header
  const token = String(authHeader).startsWith("Bearer ")
    ? String(authHeader).split(" ")[1]
    : String(authHeader);
  const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret";
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired session token." });
  }
};
