import React, { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "@/types/patient";

interface AuthContextType {
  role: UserRole | null;
  userName: string;
  login: (role: UserRole, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState("");

  const login = (r: UserRole, name: string) => {
    setRole(r);
    setUserName(name);
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
