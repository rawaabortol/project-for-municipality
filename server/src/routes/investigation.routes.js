import express from "express";
import {
  getInvestigations,
  createInvestigation,
  updateInvestigation,
  finalizeInvestigation,
} from "../controller/investigation.controller.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { isOfficerOrAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyAuth, isOfficerOrAdmin);

router.get("/", getInvestigations);
router.post("/", createInvestigation);
router.post("/report/:reportId/finalize", finalizeInvestigation);
router.put("/:id", updateInvestigation);

export default router;
