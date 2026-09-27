import { apiClient } from "../utils/axios";
import { toUser } from "../utils/normalize";
import { User, UserRole } from "../utils/sampleData";

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await apiClient.get("/users");
    return data.users.map(toUser);
  },

  getOfficers: async (): Promise<User[]> => {
    const { data } = await apiClient.get("/users/officers");
    return data.users.map(toUser);
  },

  createCitizen: async (payload: {
    name: string;
    email: string;
    phone?: string;
    district?: string;
    password: string;
  }): Promise<User> => {
    const { data } = await apiClient.post("/users", payload);
    return toUser(data.user);
  },

  updateRole: async (
    userId: string,
    role: UserRole,
    badgeNumber?: string,
    title?: string,
  ): Promise<User> => {
    const { data } = await apiClient.put(`/users/${userId}/role`, { role, badgeNumber, title });
    return toUser(data.user);
  },

  updateMyProfile: async (updates: Partial<User>): Promise<User> => {
    const { data } = await apiClient.put("/users/me", updates);
    return toUser(data.user);
  },
};

export default userService;
