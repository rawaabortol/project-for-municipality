import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { USER_ROLES } from "../constant/index.js";
import { httpError } from "../middleware/errorHandler.js";

class NotificationService {
  /**
   * Notify a single user. Failures are logged, never thrown: notifications must not
   * break the primary transaction that triggered them.
   */
  static async notifyUser(userId, { title, message, type = "STATUS_UPDATE", link = "" }) {
    if (!userId || !mongoose.isValidObjectId(userId)) return null;
    try {
      return await Notification.create({ userId, title, message, type, link });
    } catch (error) {
      console.error("Failed to create notification:", error);
      return null;
    }
  }

  /**
   * Notify every active health officer and administrator (e.g. critical incidents, clusters).
   */
  static async notifyStaff({ title, message, type = "CRITICAL_ALERT", link = "" }) {
    try {
      const staff = await User.find({
        role: { $in: [USER_ROLES.HEALTH_OFFICER, USER_ROLES.ADMINISTRATOR] },
        isActive: { $ne: false },
      })
        .select("_id")
        .lean();
      if (!staff.length) return [];
      return await Notification.insertMany(
        staff.map((u) => ({ userId: u._id, title, message, type, link })),
      );
    } catch (error) {
      console.error("Failed to notify staff:", error);
      return [];
    }
  }

  static async getForUser(userId, { limit = 50 } = {}) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  static async markAsRead(id, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true },
    ).lean();
    if (!notification) throw httpError(404, "Notification not found");
    return notification;
  }

  static async markAllAsRead(userId) {
    const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return result.modifiedCount;
  }
}

export default NotificationService;
