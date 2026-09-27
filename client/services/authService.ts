import { apiClient } from "../utils/axios";
import { authStorage } from "../utils/authStorage";
import { toUser } from "../utils/normalize";
import { User } from "../utils/sampleData";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  district?: string;
}

const storeSession = (data: { user: any; token: string }): User => {
  const user = toUser(data.user);
  authStorage.setToken(data.token);
  authStorage.setUser(user);
  return user;
};

export const authService = {
  getStoredUser: (): User | null => (authStorage.getToken() ? authStorage.getUser<User>() : null),

  login: async (email: string, password: string): Promise<User> => {
    const { data } = await apiClient.post("/auth/login", { email: email.trim(), password });
    return storeSession(data.data);
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const { data } = await apiClient.post("/auth/register", payload);
    return storeSession(data.data);
  },

  /** Re-validates the stored token and returns the fresh user record. */
  fetchMe: async (): Promise<User> => {
    const { data } = await apiClient.get("/auth/me");
    const user = toUser(data.data.user);
    authStorage.setUser(user);
    return user;
  },

  logout: (): void => {
    authStorage.clear();
  },
};

export default authService;
