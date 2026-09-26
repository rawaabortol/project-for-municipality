import { authStorage } from '../utils/authStorage';
import { dbInstance } from '../utils/axios';
import { User, initialUsers } from '../utils/sampleData';

export const authService = {
  getCurrentUser: (): User | null => {
    const saved = authStorage.getUser<User>();
    if (saved) return saved;
    // Default to Health Officer for rich interactive triage testing
    const defaultUser = initialUsers.find(u => u.role === 'HEALTH_OFFICER') || initialUsers[3];
    authStorage.setUser(defaultUser);
    return defaultUser;
  },

  switchRoleAccount: (role: 'CITIZEN' | 'HEALTH_OFFICER' | 'ADMINISTRATOR', specificUserId?: string): User => {
    let user: User | undefined;
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
