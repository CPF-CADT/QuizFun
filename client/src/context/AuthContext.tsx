import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { 
  isTokenValid, 
  setToken, 
  getStoredUser, 
  setStoredUser, 
  logout as clearAuthData 
} from '../service/auth';

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (loginResponse: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const validateAuth = useCallback(() => {
    try {
      if (isTokenValid()) {
        const storedUser = getStoredUser();
        setUser(storedUser);
      } else {
        clearAuthData();
        setUser(null);
      }
    } catch (error) {
      console.error("Authentication validation failed:", error);
      clearAuthData();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    validateAuth();
  }, [validateAuth]);

  const login = (loginResponse: LoginResponse) => {
    setToken(loginResponse.token);
    setStoredUser(loginResponse.user);
    setUser(loginResponse.user);
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    window.location.href = '/login'; 
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user && !isLoading,
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
