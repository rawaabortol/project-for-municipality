import express from "express";
import {
  getClusters,
  triggerClusterDetection,
  updateClusterStatus,
} from "../controller/cluster.controller.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { isOfficerOrAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyAuth, isOfficerOrAdmin);

router.get("/", getClusters);
router.post("/detect", triggerClusterDetection);
router.put("/:id/status", updateClusterStatus);

export default router;
