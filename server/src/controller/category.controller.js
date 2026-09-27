import CategoryService from "../service/category.service.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { USER_ROLES } from "../constant/index.js";

class CategoryController {
  static getCategories = asyncHandler(async (req, res) => {
    const includeInactive =
      req.user?.role === USER_ROLES.ADMINISTRATOR && req.query.all === "true";
    const categories = await CategoryService.getCategories({ includeInactive });
    return res.json({ success: true, categories });
  });

  static createCategory = asyncHandler(async (req, res) => {
    const category = await CategoryService.createCategory(req.body, req.user);
    return res.status(201).json({ success: true, category });
  });

  static updateCategory = asyncHandler(async (req, res) => {
    const category = await CategoryService.updateCategory(req.params.id, req.body, req.user);
    return res.json({ success: true, category });
  });
}

export default CategoryController;
