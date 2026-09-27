import express from "express";
import {
  getReports,
  getReportById,
  createReport,
  updateReportStatus,
  assignOfficer,
  reassessRisk,
} from "../controller/report.controller.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { isOfficerOrAdmin, isAdminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyAuth);

router.get("/", getReports);
router.post("/", createReport);
router.post("/reassess-risk", isAdminOnly, reassessRisk);
router.get("/:id", getReportById);
router.put("/:id/status", isOfficerOrAdmin, updateReportStatus);
router.put("/:id/assign", isOfficerOrAdmin, assignOfficer);

export default router;
