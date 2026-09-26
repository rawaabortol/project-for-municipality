import UserModel from '../../server/src/models/User.js';
import RoleModel from '../../server/src/models/Role.js';
import { authStorage } from '../utils/authStorage';
import { dbInstance } from '../utils/axios';
import { User, initialUsers } from '../utils/sampleData';

/**
 * Client Auth Service utilizing Mongoose User & Role Models
 */
export const authService = {
  // Direct reference to Mongoose Models
  model: UserModel,
  roleModel: RoleModel,

  getCurrentUser: (): User | null => {
    return authStorage.getUser<User>() || null;
  },

  switchRoleAccount: (role: 'CITIZEN' | 'HEALTH_OFFICER' | 'ADMINISTRATOR', specificUserId?: string): User | null => {
    let user: User | undefined;
    if (specificUserId) {
      user = dbInstance.users.find(u => u.id === specificUserId);
    }
    if (!user) {
      user = dbInstance.users.find(u => u.role === role);
    }
    if (!user && dbInstance.users.length > 0) {
      user = dbInstance.users[0];
    }
    if (user) {
      authStorage.setUser(user);
      authStorage.setToken(`demo-token-${user.id}`);
      return user;
    }
    return null;
  },

  login: async (email: string, role?: string): Promise<User> => {
    let user = dbInstance.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: (role as any) || 'CITIZEN',
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

  logout: (): void => {
    authStorage.clear();
  }
};

export default authService;
