// src/context/authContext.tsx
import {
  useState,
  useEffect,
  useContext,
  createContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  authApi,
  setupAuthInterceptors,
  type ILoginResponse,
  type IUser,
} from "../service/api";
import { setStoredUser, clearClientAuthData } from "../service/auth";

interface AuthContextType {
  user: IUser | null;
  login: (credentials: object) => Promise<void>;
  logout: () => void;
  socialLogin: (loginData: ILoginResponse) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const accessTokenRef = useRef<string | null>(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const handleLogout = () => {
    if (accessTokenRef.current) {
      authApi.logout().catch(() => {
        // ignore, cleanup anyway
      });
    }
    setAccessToken(null);
    setUser(null);
    clearClientAuthData();
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const { data } = await authApi.refreshToken();
      setAccessToken(data.accessToken);

      // fetch profile only on refresh to keep session alive
      const userResponse = await authApi.getProfile();
      setUser(userResponse.data);
      setStoredUser(userResponse.data);

      return data.accessToken;
    } catch {
      handleLogout();
      return null;
    }
  };

  useEffect(() => {
  const cleanupInterceptors = setupAuthInterceptors(
    setAccessToken,  
    handleLogout,
    accessTokenRef    
  );

  (async () => {
    await refreshToken();
    setIsLoading(false);
  })();

  return cleanupInterceptors;
}, []);

  const handleLogin = async (credentials: object) => {
    const { data } = await authApi.login(credentials);
    const { accessToken: newAccessToken, user: userData } = data;
    setAccessToken(newAccessToken);
    setUser(userData);
    setStoredUser(userData);
  };

  const handleSocialLogin = (loginData: ILoginResponse) => {
    const { accessToken: newAccessToken, user: userData } = loginData;
    setAccessToken(newAccessToken);
    setUser(userData);
    setStoredUser(userData);
  };

  const value = useMemo(
    () => ({
      user,
      login: handleLogin,
      logout: handleLogout,
      socialLogin: handleSocialLogin,
      isAuthenticated: !!accessToken,
      isLoading,
    }),
    [user, accessToken, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? (
        children
      ) : (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
          Loading...
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
