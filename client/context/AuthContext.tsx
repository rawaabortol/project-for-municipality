import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "../utils/sampleData";
import { authService, RegisterPayload } from "../services/authService";
import { userService } from "../services/userService";
import { authStorage } from "../utils/authStorage";
import { SESSION_EXPIRED_EVENT } from "../utils/axios";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  /** Resolves to the signed-in user; rejects with the server's error message. */
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  /** True while a stored session is being re-validated against the server on startup. */
  isRestoringSession: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => authService.getStoredUser());
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(() => !!authStorage.getToken());

  const setCurrentUser = useCallback((user: User | null) => {
    if (user) authStorage.setUser(user);
    setCurrentUserState(user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUserState(null);
  }, []);

  // Re-validate a stored token once on startup (role or account status may have changed)
  useEffect(() => {
    if (!authStorage.getToken()) return;
    authService
      .fetchMe()
      .then(setCurrentUserState)
      .catch(() => logout())
      .finally(() => setIsRestoringSession(false));
  }, [logout]);

  // The API client clears storage on any 401; mirror that in React state
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

  const login = async (email: string, password: string): Promise<User> => {
    const user = await authService.login(email, password);
    setCurrentUserState(user);
    return user;
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    const user = await authService.register(payload);
    setCurrentUserState(user);
    return user;
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    const updated = await userService.updateMyProfile(updates);
    setCurrentUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!currentUser,
        isRestoringSession,
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
