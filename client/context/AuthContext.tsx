import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../utils/sampleData";
import { authService } from "../services/authService";
import { dbInstance } from "../utils/axios";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (
    role: "CITIZEN" | "HEALTH_OFFICER" | "ADMINISTRATOR",
    specificUserId?: string,
  ) => void;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (userData: Omit<User, "id">) => Promise<User | null>;
  updateProfile: (updates: Partial<User>) => User | null;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return authService.getCurrentUser();
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!authService.getCurrentUser();
  });

  const switchRole = (
    role: "CITIZEN" | "HEALTH_OFFICER" | "ADMINISTRATOR",
    specificUserId?: string,
  ) => {
    const switched = authService.switchRoleAccount(role, specificUserId);
    if (switched) {
      setCurrentUser(switched);
      setIsAuthenticated(true);
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const user = await authService.login(email, password);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const register = async (userData: Omit<User, "id">): Promise<User | null> => {
    try {
      const resp = await dbInstance.apiPost("/api/auth/register", userData);
      const newUser = resp.user as User;
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      return newUser;
    } catch (e) {
      return null;
    }
  };

  const updateProfile = (updates: Partial<User>): User | null => {
    if (!currentUser) return null;
    const updated = dbInstance.updateUserProfile(currentUser.id, updates);
    if (updated) {
      setCurrentUser({ ...updated });
    }
    return updated;
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
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
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
