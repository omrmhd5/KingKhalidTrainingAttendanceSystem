import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type AppRole = "admin" | "operator" | "viewer";

interface AuthContextType {
  user: { email: string; id: string } | null;
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
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for mock user
    const storedUser = localStorage.getItem("mockUser");
    const storedRole = localStorage.getItem("mockRole");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setRole((storedRole as AppRole) ?? null);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Mock sign in
      const mockUser = {
        email,
        id: "user_" + Math.random().toString(36).substr(2, 9),
      };
      localStorage.setItem("mockUser", JSON.stringify(mockUser));
      localStorage.setItem("mockRole", "admin");
      setUser(mockUser);
      setRole("admin");
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Mock sign up
      const mockUser = {
        email,
        id: "user_" + Math.random().toString(36).substr(2, 9),
      };
      localStorage.setItem("mockUser", JSON.stringify(mockUser));
      localStorage.setItem("mockRole", "operator");
      setUser(mockUser);
      setRole("operator");
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("mockUser");
    localStorage.removeItem("mockRole");
    setUser(null);
    setRole(null);
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
