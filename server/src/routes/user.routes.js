import express from "express";
import {
  getUsers,
  getOfficers,
  createUser,
  updateUserRole,
  updateMyProfile,
} from "../controller/user.controller.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { isAdminOnly, isOfficerOrAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyAuth);

router.put("/me", updateMyProfile);
router.get("/officers", isOfficerOrAdmin, getOfficers);
router.get("/", isAdminOnly, getUsers);
router.post("/", isAdminOnly, createUser);
router.put("/:id/role", isAdminOnly, updateUserRole);

export default router;
