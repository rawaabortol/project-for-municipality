import express from "express";
import CategoryController from "../controller/category.controller.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { isAdminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyAuth);

router.get("/", CategoryController.getCategories);
router.post("/", isAdminOnly, CategoryController.createCategory);
router.put("/:id", isAdminOnly, CategoryController.updateCategory);

export default router;
