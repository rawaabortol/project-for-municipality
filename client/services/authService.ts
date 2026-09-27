import { authStorage } from "../utils/authStorage";
import { dbInstance } from "../utils/axios";
import { User } from "../utils/sampleData";

/**
 * Browser-safe auth service.
 */
export const authService = {
  getCurrentUser: (): User | null => {
    // Return stored user only; do not inject demo/static users.
    return authStorage.getUser<User>() || null;
  },

  switchRoleAccount: (
    role: "CITIZEN" | "HEALTH_OFFICER" | "ADMINISTRATOR",
    specificUserId?: string,
  ): User | null => {
    // Server-driven role switching is preferred; local fallback searches dbInstance only if necessary
    let user: User | undefined;
    if (specificUserId) {
      user = dbInstance.users.find((u) => u.id === specificUserId);
    }
    if (!user) {
      user = dbInstance.users.find((u) => u.role === role);
    }
    if (!user && dbInstance.users.length > 0) {
      user = dbInstance.users[0];
    }
    if (user) {
      authStorage.setUser(user);
      authStorage.setToken(`token-${user.id}`);
      return user;
    }
    return null;
  },

  login: async (email: string, password?: string): Promise<User> => {
    // Call backend to authenticate
    const resp = await dbInstance.apiPost("/api/auth/login", {
      email,
      password,
    });
    const user = resp.user as User;
    authStorage.setUser(user);
    authStorage.setToken(resp.token);
    return user;
  },

  logout: (): void => {
    authStorage.clear();
  },
};

export default authService;
