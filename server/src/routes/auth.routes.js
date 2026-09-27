import express from "express";
import AuthController from "../controller/auth.controller.js";
import { loginRules } from "../middleware/auth.validation.js";

const router = express.Router();

router.post("/register", AuthController.registerRefugeeController);
router.post("/login", loginRules, AuthController.login);

export default router;
