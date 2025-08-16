// src/context/authContext.tsx
import { useState, useEffect, useContext, createContext, type ReactNode } from 'react';
import { authApi } from '../service/api';
import { 
  setAccessToken, 
  setStoredUser, 
  getStoredUser, 
  clearClientAuthData 
} from '../service/auth';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedUser = getStoredUser();
      
      if (!storedUser || !localStorage.getItem('accessToken')) {
        setIsLoading(false);
        return;
      }
      
      try {
        await authApi.getProfile(); 
        
        setUser(storedUser);
      } catch (error) {
        console.error("Session verification failed:", error);
        clearClientAuthData();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (credentials: object) => {
    // The API call will throw an error on failure, which will be caught by the Login component.
    const { data } = await authApi.login(credentials);
    const { accessToken, user: userData } = data;
    
    // On success, store the access token and user data, and update the state.
    setAccessToken(accessToken);
    setStoredUser(userData);
    setUser(userData);
  };

  const logout = async () => {
    try {
        await authApi.logout();
    } catch (error) {
        console.error("Logout API call failed", error);
    } finally {
        // Always clear client-side data and update state.
        clearClientAuthData();
        setUser(null);
    }
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
      {/* Don't render the rest of the app until the initial authentication check is complete. */}
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
