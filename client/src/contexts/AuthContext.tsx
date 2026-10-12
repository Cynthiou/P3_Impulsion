import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import authApi from "../services/authApi";
import type { CurrentUser } from "../services/authApi";

type AuthContextValue = {
  user: CurrentUser | null;
  isInitializing: boolean;
  setUser: (nextUser: CurrentUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const currentUser = await authApi.fetchCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    }

    restoreSession();
  }, []);

  const value = useMemo(
    () => ({ user, isInitializing, setUser }),
    [user, isInitializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
