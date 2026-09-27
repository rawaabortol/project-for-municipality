import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { USER_ROLES, TRIPOLI_DISTRICTS } from "../constant/index.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/auth.js";
import { logAuditAction } from "./auditService.js";
import { httpError } from "../middleware/errorHandler.js";

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 6;

const generateToken = (user) =>
  jwt.sign({ id: String(user._id), role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

export const toSafeUser = (user) => {
  const obj = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

export const assertValidPassword = (password) => {
  if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
    throw httpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
};

class AuthService {
  /**
   * Public self-registration. Always creates a CITIZEN; roles are granted by an administrator.
   */
  static async register(body = {}) {
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const district = TRIPOLI_DISTRICTS.includes(body.district) ? body.district : undefined;

    if (!name || !email) throw httpError(400, "Name and email are required");
    assertValidPassword(body.password);

    const duplicateChecks = [{ email }];
    if (phone) duplicateChecks.push({ phone });
    const existingUser = await User.findOne({ $or: duplicateChecks });
    if (existingUser) throw httpError(409, "User already exists with this email or phone");

    const user = await User.create({
      name,
      email,
      phone,
      district,
      role: USER_ROLES.CITIZEN,
      password: await hashPassword(body.password),
    });

    await logAuditAction({
      user,
      action: "USER_REGISTER",
      resource: `User ${user.email}`,
      details: "Citizen registered account",
    });

    return { user: toSafeUser(user), token: generateToken(user) };
  }

  static async login({ phone, email, password } = {}) {
    if (!password) throw httpError(400, "Password is required");
    if (!phone && !email) throw httpError(400, "Phone or email is required");

    const query = email
      ? { email: String(email).trim().toLowerCase() }
      : { phone: String(phone).trim() };

    const user = await User.findOne(query);
    if (!user || !(await bcrypt.compare(String(password), user.password))) {
      throw httpError(401, "Invalid credentials");
    }
    if (user.isActive === false) throw httpError(403, "Account is deactivated");

    await logAuditAction({
      user,
      action: "USER_LOGIN",
      resource: `User ${user.email}`,
      details: "User authenticated into system",
    });

    return { user: toSafeUser(user), token: generateToken(user) };
  }
}

export default AuthService;
