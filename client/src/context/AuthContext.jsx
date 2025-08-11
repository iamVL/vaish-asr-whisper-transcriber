import { createContext, useContext, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    setToken(data.access_token);
    localStorage.setItem("token", data.access_token);
    setUser({ username });
    localStorage.setItem("user", JSON.stringify({ username }));
  };

  const signup = async (username, email, password) => {
    await api.post("/auth/signup", { username, email, password });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout, isAuthed: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
