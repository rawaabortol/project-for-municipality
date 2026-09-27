import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET } from "../config/auth.js";

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
};

/**
 * Authentication Middleware
 * Verifies the JWT and loads the current user from MongoDB so that
 * req.user always reflects the latest role / name / badge (the token only carries the id).
 */
export const verifyAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. No bearer token provided.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired session token." });
  }

  try {
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Account not found or deactivated.",
      });
    }
    req.user = { ...user, id: String(user._id) };
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Same as verifyAuth but lets anonymous requests through (req.user stays undefined).
 */
export const optionalAuth = (req, res, next) => {
  if (!extractToken(req)) return next();
  return verifyAuth(req, res, next);
};
