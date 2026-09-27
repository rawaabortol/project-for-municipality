import { apiClient } from "../utils/axios";
import { toCategory } from "../utils/normalize";
import { Category } from "../utils/sampleData";

export const categoryService = {
  /** Active categories; administrators can pass includeInactive to see disabled ones too. */
  getCategories: async (includeInactive = false): Promise<Category[]> => {
    const { data } = await apiClient.get("/categories", {
      params: includeInactive ? { all: "true" } : undefined,
    });
    return data.categories.map(toCategory);
  },

  createCategory: async (payload: {
    name: string;
    baseWeight: number;
    description?: string;
    icon?: string;
  }): Promise<Category> => {
    const { data } = await apiClient.post("/categories", payload);
    return toCategory(data.category);
  },

  updateCategory: async (
    id: string,
    updates: Partial<Pick<Category, "baseWeight" | "description" | "icon" | "isActive">>,
  ): Promise<Category> => {
    const { data } = await apiClient.put(`/categories/${id}`, updates);
    return toCategory(data.category);
  },
};

export default categoryService;
