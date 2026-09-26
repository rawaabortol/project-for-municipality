import UserModel from '../../server/src/models/User.js';
import RoleModel from '../../server/src/models/Role.js';
import { authStorage } from '../utils/authStorage.js';
import { dbInstance } from '../utils/axios.js';
import { initialUsers } from '../utils/sampleData.js';

export const authService = {
  model: UserModel,
  roleModel: RoleModel,

  getCurrentUser: () => {
    const saved = authStorage.getUser();
    if (saved) return saved;
    const defaultUser = initialUsers.find(u => u.role === 'HEALTH_OFFICER') || initialUsers[3];
    authStorage.setUser(defaultUser);
    return defaultUser;
  },

  switchRoleAccount: (role, specificUserId) => {
    let user;
    if (specificUserId) {
      user = dbInstance.users.find(u => u.id === specificUserId);
    }
    if (!user) {
      user = dbInstance.users.find(u => u.role === role);
    }
    if (!user) {
      user = initialUsers[0];
    }
    authStorage.setUser(user);
    authStorage.setToken(`demo-token-${user.id}`);
    return user;
  },

  login: async (email, role) => {
    let user = dbInstance.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: role || 'CITIZEN',
        phone: '+961 70 000000',
        district: 'Al-Tal'
      };
      dbInstance.users.push(user);
      dbInstance.persistAll();
    }
    authStorage.setUser(user);
    authStorage.setToken(`token-${user.id}`);
    return user;
  },

  logout: () => {
    authStorage.clear();
  }
};

export default authService;
