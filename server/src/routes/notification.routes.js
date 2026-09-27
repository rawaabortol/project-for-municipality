import express from "express";
import NotificationController from "../controller/notification.controller.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyAuth);

router.get("/", NotificationController.getMyNotifications);
router.put("/read-all", NotificationController.markAllAsRead);
router.put("/:id/read", NotificationController.markAsRead);

export default router;
