import User from "../models/User.js";
import { logAuditAction } from "./auditService.js";
import { hashPassword, assertValidPassword, toSafeUser } from "./auth.service.js";
import { httpError } from "../middleware/errorHandler.js";
import { USER_ROLES, TRIPOLI_DISTRICTS } from "../constant/index.js";

const PROFILE_FIELDS = ["name", "phone", "district", "title", "bio", "avatar"];

const DEFAULT_TITLES = {
  [USER_ROLES.CITIZEN]: "Resident Reporter",
  [USER_ROLES.HEALTH_OFFICER]: "Municipal Field Inspector",
  [USER_ROLES.ADMINISTRATOR]: "Health Directorate Administrator",
};

const generateBadge = (role) =>
  `TRP-${role === USER_ROLES.ADMINISTRATOR ? "ADM" : "OFF"}-${Math.floor(100 + Math.random() * 900)}`;

class UserService {
  static async getUsersFromDB() {
    return User.find().select("-password").sort({ createdAt: -1 }).lean();
  }

  static async getOfficersFromDB() {
    return User.find({ role: USER_ROLES.HEALTH_OFFICER, isActive: { $ne: false } })
      .select("name badgeNumber district title")
      .sort({ name: 1 })
      .lean();
  }

  static async createUserInDB(body = {}, actor) {
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    if (!name || !email) throw httpError(400, "Name and email are required");
    assertValidPassword(body.password);

    const duplicateChecks = [{ email }];
    if (phone) duplicateChecks.push({ phone });
    if (await User.exists({ $or: duplicateChecks })) {
      throw httpError(409, "User already exists with this email or phone");
    }

    // New accounts always start as citizens; roles are granted through updateUserRoleInDB
    const user = await User.create({
      name,
      email,
      phone,
      district: TRIPOLI_DISTRICTS.includes(body.district) ? body.district : undefined,
      role: USER_ROLES.CITIZEN,
      title: DEFAULT_TITLES[USER_ROLES.CITIZEN],
      password: await hashPassword(body.password),
    });

    await logAuditAction({
      user: actor,
      action: "CREATE_USER",
      resource: `User ${user.email}`,
      details: `Citizen account created by administrator`,
    });
    return toSafeUser(user);
  }

  static async updateUserRoleInDB(id, { role, badgeNumber, title } = {}, actor) {
    if (!Object.values(USER_ROLES).includes(role)) throw httpError(400, `Invalid role: ${role}`);
    if (String(id) === String(actor?._id) && role !== USER_ROLES.ADMINISTRATOR) {
      throw httpError(400, "You cannot remove your own administrator role");
    }

    const user = await User.findById(id);
    if (!user) throw httpError(404, "User not found");

    const previousRole = user.role;
    user.role = role;
    if (role === USER_ROLES.CITIZEN) {
      user.badgeNumber = undefined;
      user.title = DEFAULT_TITLES[role];
    } else {
      user.badgeNumber = String(badgeNumber || "").trim() || user.badgeNumber || generateBadge(role);
      user.title = String(title || "").trim() || DEFAULT_TITLES[role];
    }
    await user.save();

    await logAuditAction({
      user: actor,
      action: "UPDATE_USER_ROLE",
      resource: `User ${user.email}`,
      details: `Role changed ${previousRole} -> ${role}${user.badgeNumber ? ` (badge ${user.badgeNumber})` : ""}`,
    });

    return toSafeUser(user);
  }

  static async updateProfileInDB(userId, updates = {}) {
    const fields = Object.fromEntries(
      PROFILE_FIELDS.filter((key) => updates[key] !== undefined).map((key) => [key, updates[key]]),
    );
    if (updates.avatarUrl !== undefined) fields.avatar = updates.avatarUrl;
    if (fields.name !== undefined && !String(fields.name).trim()) {
      throw httpError(400, "Name cannot be empty");
    }
    if (fields.district !== undefined && !TRIPOLI_DISTRICTS.includes(fields.district)) {
      throw httpError(400, `Unknown district: ${fields.district}`);
    }
    if (fields.phone) {
      const phone = String(fields.phone).trim();
      if (await User.exists({ phone, _id: { $ne: userId } })) {
        throw httpError(409, "Phone number already in use");
      }
    }

    const user = await User.findByIdAndUpdate(userId, fields, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();
    if (!user) throw httpError(404, "User not found");
    return user;
  }
}

export default UserService;
