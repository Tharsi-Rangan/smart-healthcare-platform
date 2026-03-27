import { createContext, useContext, useMemo, useState } from "react";
import {
  clearAuthData,
  getStoredUser,
  getToken,
  saveAuthData,
} from "./authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getStoredUser());

  const login = ({ token, user }) => {
    saveAuthData({ token, user });
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}