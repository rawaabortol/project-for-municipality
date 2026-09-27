import NotificationService from "../service/notification.service.js";
import asyncHandler from "../middleware/asyncHandler.js";

class NotificationController {
  static getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await NotificationService.getForUser(req.user._id);
    return res.json({ success: true, notifications });
  });

  static markAsRead = asyncHandler(async (req, res) => {
    const notification = await NotificationService.markAsRead(req.params.id, req.user._id);
    return res.json({ success: true, notification });
  });

  static markAllAsRead = asyncHandler(async (req, res) => {
    const updated = await NotificationService.markAllAsRead(req.user._id);
    return res.json({ success: true, updated });
  });
}

export default NotificationController;
