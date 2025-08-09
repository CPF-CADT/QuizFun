// src/contexts/authContext.ts

import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { setToken, setStoredUser, getStoredUser, clearClientAuthData } from '../service/auth';
import { authApi, apiClient } from '../service/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginResponseData {
  accessToken: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: object) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Apply the correct props type to the function signature
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logoutUser = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed on server:", error);
    } finally {
      clearClientAuthData();
      setUser(null);
    }
  }, []);

  const verifyAuth = useCallback(async () => {
    try {
      const { data } = await apiClient.post<{ accessToken: string }>('/user/refresh-token');
      setToken(data.accessToken);
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      } else {
        // If we have a valid session but no user data, the user should be logged out.
        await logoutUser();
      }
    } catch (error) {
      setUser(null);
      clearClientAuthData();
    } finally {
      setIsLoading(false);
    }
  }, [logoutUser]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const login = async (credentials: object) => {
    const { data } = await authApi.login(credentials);
    const { accessToken, user: userData }: LoginResponseData = data;
    
    setToken(accessToken);
    setStoredUser(userData);
    setUser(userData);
  };

  const logout = async () => {
    await logoutUser();
    // Redirect after state is cleared
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};