import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, initialUsers } from '../utils/sampleData';
import { authService } from '../services/authService';
import { dbInstance } from '../utils/axios';

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: 'CITIZEN' | 'HEALTH_OFFICER' | 'ADMINISTRATOR', specificUserId?: string) => void;
  login: (email: string, password?: string) => boolean;
  register: (userData: Omit<User, 'id'>) => User;
  updateProfile: (updates: Partial<User>) => User | null;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return authService.getCurrentUser() || initialUsers[3]; // Default to Dr. Tariq Al-Hajj (Officer) for rich immediate demo
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const switchRole = (role: 'CITIZEN' | 'HEALTH_OFFICER' | 'ADMINISTRATOR', specificUserId?: string) => {
    const switched = authService.switchRoleAccount(role, specificUserId);
    setCurrentUser(switched);
    setIsAuthenticated(true);
  };

  const login = (email: string, password?: string): boolean => {
    const user = dbInstance.loginUser(email, password);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const register = (userData: Omit<User, 'id'>): User => {
    // Security Enforcement: New users cannot be employees or officers.
    // They are created strictly as CITIZEN. Roles are assigned exclusively by administrators.
    const newUser = dbInstance.registerUser({
      ...userData,
      role: 'CITIZEN'
    });
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  };

  const updateProfile = (updates: Partial<User>): User | null => {
    const updated = dbInstance.updateUserProfile(currentUser.id, updates);
    if (updated) {
      setCurrentUser({ ...updated });
    }
    return updated;
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    // Set to guest citizen or keep minimal reference
    const guest = initialUsers[10];
    setCurrentUser(guest);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
