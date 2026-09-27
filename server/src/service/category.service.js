import Category from "../models/Category.js";
import { DEFAULT_CATEGORIES } from "../constant/index.js";
import { logAuditAction } from "./auditService.js";
import { httpError } from "../middleware/errorHandler.js";

const UPDATABLE_FIELDS = ["description", "baseWeight", "icon", "isActive"];

class CategoryService {
  /**
   * Inserts the default Tripoli hazard categories on first boot.
   */
  static async seedDefaultCategories() {
    if ((await Category.estimatedDocumentCount()) > 0) return 0;
    await Category.insertMany(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES.length;
  }

  static async getCategories({ includeInactive = false } = {}) {
    const filter = includeInactive ? {} : { isActive: { $ne: false } };
    return Category.find(filter).sort({ name: 1 }).lean();
  }

  static async createCategory(body = {}, actor) {
    const name = String(body.name || "").trim();
    if (!name) throw httpError(400, "Category name is required");
    const code = String(body.code || name)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    const category = await Category.create({
      name,
      code,
      description: body.description || "",
      baseWeight: body.baseWeight,
      icon: body.icon,
    });

    await logAuditAction({
      user: actor,
      action: "CREATE_CATEGORY",
      resource: `Category ${category.code}`,
      details: `${category.name} (weight ${category.baseWeight})`,
    });
    return category;
  }

  static async updateCategory(id, body = {}, actor) {
    const fields = Object.fromEntries(
      UPDATABLE_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]),
    );
    const category = await Category.findByIdAndUpdate(id, fields, {
      new: true,
      runValidators: true,
    }).lean();
    if (!category) throw httpError(404, "Category not found");

    await logAuditAction({
      user: actor,
      action: "UPDATE_CATEGORY",
      resource: `Category ${category.code}`,
      details: JSON.stringify(fields),
    });
    return category;
  }
}

export default CategoryService;
