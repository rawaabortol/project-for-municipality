import express from "express";
import {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
} from "../controller/alert.controller.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { isOfficerOrAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyAuth, isOfficerOrAdmin);

router.get("/", getAlerts);
router.put("/:id/ack", acknowledgeAlert);
router.put("/:id/resolve", resolveAlert);

export default router;
