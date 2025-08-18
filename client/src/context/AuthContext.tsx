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

  // --- START: THE FIX ---
  const handleLogout = () => {
    // Only call the backend logout endpoint if the user was actually logged in.
    if (accessTokenRef.current) {
      authApi.logout().catch(error => {
        // This error is not critical, as we are clearing the client-side state anyway.
        console.error("Server logout failed, proceeding with client-side cleanup.", error);
      });
    }
    
    // Always perform client-side cleanup.
    setAccessToken(null);
    setUser(null);
    clearClientAuthData();
  };
  // --- END: THE FIX ---
  
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
        handleLogout(); // This will now correctly perform a client-side only logout
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