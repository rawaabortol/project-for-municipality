import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { USER_ROLES } from "../constant/index.js";

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });

class UserService {
  static async register(body) {
    const { password, phone, ...other } = body;

    if (!password) {
      const err = new Error("Password is required");
      err.statusCode = 400;
      throw err;
    }

    const cleanPhone = String(phone || "").trim();
    const cleanEmail = String(other.email || "")
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });

    if (existingUser) {
      const err = new Error("User already exists");
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      ...other,
      email: cleanEmail,
      phone: cleanPhone,
      role: other.role || USER_ROLES.CITIZEN,
      password: hashedPassword,
    });

    const token = generateToken(user);
    const safeUser = user.toObject();
    delete safeUser.password;

    return { user: safeUser, token };
  }

  static async login({ phone, email, password }) {
    if (!password) {
      const err = new Error("Password is required");
      err.statusCode = 400;
      throw err;
    }

    if (!phone && !email) {
      const err = new Error("Phone or email is required");
      err.statusCode = 400;
      throw err;
    }

    const query = phone
      ? { phone: String(phone).trim() }
      : {
          email: String(email || "")
            .trim()
            .toLowerCase(),
        };

    const user = await User.findOne(query);

    if (!user) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    const token = generateToken(user);
    const safeUser = user.toObject();
    delete safeUser.password;

    return { user: safeUser, token };
  }
}

export default UserService;
