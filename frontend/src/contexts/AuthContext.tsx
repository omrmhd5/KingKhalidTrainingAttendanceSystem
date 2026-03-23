import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { userApi } from "@/lib/userApi";

type AppRole = "admin" | "operator" | "teacher";

interface AuthContextType {
  user: { email: string; id: string; username: string; role: AppRole } | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{
    email: string;
    id: string;
    username: string;
    role: AppRole;
  } | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get current user from backend
    const checkUser = async () => {
      try {
        const currentUser = await userApi.getCurrentUser();
        setUser({
          email: currentUser.email,
          id: currentUser._id,
          username: currentUser.username,
          role: currentUser.role as AppRole,
        });
        setRole(currentUser.role as AppRole);
      } catch (error) {
        // User not authenticated, clear state
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const response = await userApi.login(username, password);
      const userData = response.user;
      setUser({
        email: userData.email,
        id: userData._id,
        username: userData.username,
        role: userData.role as AppRole,
      });
      setRole(userData.role as AppRole);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await userApi.createUser({
        username: fullName,
        email,
        password,
        confirmPassword: password,
        role: "operator",
      });
      const userData = response.user;
      setUser({
        email: userData.email,
        id: userData._id,
        username: userData.username,
        role: userData.role as AppRole,
      });
      setRole(userData.role as AppRole);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || error };
    }
  };

  const signOut = async () => {
    try {
      await userApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
