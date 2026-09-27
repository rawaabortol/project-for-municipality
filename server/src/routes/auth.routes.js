import express from "express";
import AuthController from "../controller/auth.controller.js";
import { loginRules } from "../middleware/auth.validation.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", loginRules, AuthController.login);
router.get("/me", verifyAuth, AuthController.me);

export default router;
