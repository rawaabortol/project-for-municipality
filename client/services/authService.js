import { authStorage } from "../utils/authStorage.js";
import { dbInstance } from "../utils/axios.js";
import { initialUsers } from "../utils/sampleData.js";
import axios from "axios";
export const authService = {
  getCurrentUser: () => {
    // Return stored user only; do not inject demo/static users.
    const saved = authStorage.getUser();
    return saved || null;
  },

  switchRoleAccount: (role, specificUserId) => {
    let user;
    if (specificUserId) {
      user = dbInstance.users.find((u) => u.id === specificUserId);
    }
    if (!user) {
      user = dbInstance.users.find((u) => u.role === role);
    }
    if (!user) {
      user = initialUsers[0];
    }
    authStorage.setUser(user);
    authStorage.setToken(`demo-token-${user.id}`);
    return user;
  },

  login: async (email, role) => {
    // Prefer server authentication via API
    try {
      // const resp = await dbInstance.apiPost("/api/auth/login", {
      //   email,
      //   password: role,
      // });
      // const user = resp.user;
      // authStorage.setUser(user);
      // authStorage.setToken(resp.token);
      // return user;
      const user = axios.post("http://localhost:3000/api/auth/login",{email,password});
      if(user)
        return user;
    } catch (err) {
      throw err;
    }
  },

  logout: () => {
    authStorage.clear();
  },
};

export default authService;
