import express from "express";
import {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
} from "../controller/alert.controller.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { isOfficerOrAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getAlerts);
router.put("/:id/ack", verifyAuth, isOfficerOrAdmin, acknowledgeAlert);
router.put("/:id/resolve", verifyAuth, isOfficerOrAdmin, resolveAlert);

export default router;
