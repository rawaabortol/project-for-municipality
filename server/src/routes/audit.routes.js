import express from "express";
import AuditController from "../controller/audit.controller.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { isAdminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", verifyAuth, isAdminOnly, AuditController.getAuditLogs);

export default router;
