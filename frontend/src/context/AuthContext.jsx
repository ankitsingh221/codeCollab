import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrapAuth = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
    } catch {
      setUser(null);
      localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await bootstrapAuth();
    };
    initAuth();
  }, []);

  const signup = async (name, email, password) => {
    const { data } = await axiosClient.post("/auth/signup", {
      name,
      email,
      password,
    });
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const { data } = await axiosClient.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    await axiosClient.post("/auth/logout");
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => useContext(AuthContext);
