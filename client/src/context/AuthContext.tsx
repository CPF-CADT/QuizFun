// src/context/authContext.tsx
import { useState, useEffect, useContext, createContext, useMemo, useRef, type ReactNode } from 'react';
import { authApi, setupAuthInterceptors } from '../service/api';
import { setStoredUser, clearClientAuthData } from '../service/auth';

// --- Type Definitions ---
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const accessTokenRef = useRef(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const handleLogout = () => {
    authApi.logout().catch(error => console.error("Logout API call failed", error));
    
    setAccessToken(null);
    setUser(null);
    clearClientAuthData();
  };
  
  useEffect(() => {
    const cleanupInterceptors = setupAuthInterceptors(setAccessToken, handleLogout, accessTokenRef);

    const verifyAuth = async () => {
      try {
        const { data } = await authApi.refreshToken();
        setAccessToken(data.accessToken);
        
        const userResponse = await authApi.getProfile();
        setUser(userResponse.data);
        setStoredUser(userResponse.data); 
      } catch (error) {
        console.log("No active session found.");
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
    return cleanupInterceptors;
  }, []);

  const handleLogin = async (credentials: object) => {
    const { data } = await authApi.login(credentials);
    const { accessToken: newAccessToken, user: userData } = data;
    
    setAccessToken(newAccessToken);
    setUser(userData);
    setStoredUser(userData);
  };

  const value = useMemo(() => ({
    user,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
  }), [user, accessToken, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>}
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
