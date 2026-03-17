/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { loginApi, registerApi, type AuthUser } from "../api/auth";

type Role = "doctor" | "patient" | null;

interface AuthContextValue {
  user: AuthUser | null;
  role: Role;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (
    full_name: string,
    email: string,
    password: string,
    role: "doctor" | "patient",
    age?: number
  ) => Promise<AuthUser>;
  logout: () => void;
}

interface StoredAuth {
  user: AuthUser;
  role: Role;
  token: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const getInitialState = (): { user: AuthUser | null; role: Role; token: string | null } => {
  const stored = localStorage.getItem("auth");
  if (!stored) return { user: null, role: null, token: null };
  try {
    const parsed = JSON.parse(stored) as StoredAuth;
    return {
      user: parsed.user ?? null,
      role: (parsed.role as Role) ?? null,
      token: parsed.token ?? null,
    };
  } catch {
    return { user: null, role: null, token: null };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState(getInitialState);

  const persist = useCallback((data: StoredAuth) => {
    setAuth({ user: data.user, role: data.role, token: data.token });
    localStorage.setItem("auth", JSON.stringify(data));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const res = await loginApi(email, password);
    persist({ user: res.user, role: res.user.role as Role, token: res.access_token });
    return res.user;
  }, [persist]);

  const register = useCallback(async (
    full_name: string,
    email: string,
    password: string,
    role: "doctor" | "patient",
    age?: number
  ): Promise<AuthUser> => {
    const res = await registerApi(full_name, email, password, role, age);
    persist({ user: res.user, role: res.user.role as Role, token: res.access_token });
    return res.user;
  }, [persist]);

  const logout = useCallback(() => {
    setAuth({ user: null, role: null, token: null });
    localStorage.removeItem("auth");
  }, []);

  const value: AuthContextValue = {
    user: auth.user,
    role: auth.role,
    token: auth.token,
    isAuthenticated: !!auth.user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
