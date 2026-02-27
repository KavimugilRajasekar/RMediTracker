import React, { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "@/types/patient";

// ─── Hardcoded Credentials (stored in-app, no external database needed for auth) ──
const CREDENTIALS: Record<UserRole, { username: string; password: string }> = {
  reception: { username: "Reception", password: "12345" },
  doctor: { username: "Doctor", password: "12345" },
};

interface AuthContextType {
  role: UserRole | null;
  userName: string;
  login: (role: UserRole, username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState("");

  const login = (r: UserRole, username: string, password: string): boolean => {
    const cred = CREDENTIALS[r];
    if (
      username.trim().toLowerCase() === cred.username.toLowerCase() &&
      password === cred.password
    ) {
      setRole(r);
      setUserName(cred.username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
    setUserName("");
  };

  return (
    <AuthContext.Provider value={{ role, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
