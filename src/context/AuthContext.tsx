// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { authService } from "../services/api";
import { tokenService } from "../services/tokenService";

type User = {
  id?: string;
  email: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  roles?: string[];
};

type AuthContextType = {
  user: User | null;
  login: (
    usernameOrEmail: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void | Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Marque côté client
  useEffect(() => setIsMounted(true), []);

  const refreshUser = async () => {
    if (!isMounted) return;
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();

        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement de l'utilisateur:", error);
      setUser(null);
      setIsAuthenticated(false);
      tokenService.clearAuth();
    }
  };

  // Vérifie l’auth au chargement
  useEffect(() => {
    if (!isMounted) return;
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          setUser(null);
          setIsAuthenticated(false);

          return;
        }
        const userData = await authService.getCurrentUser();

        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erreur lors de la vérification d'auth:", error);
        setUser(null);
        setIsAuthenticated(false);
        tokenService.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();
  }, [isMounted]);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const result = await authService.login({ usernameOrEmail, password });

      if (result.success && result.data) {
        setUser(result.data as User);
        setIsAuthenticated(true);

        return { success: true };
      }

      return {
        success: false,
        message: result.message || "Erreur de connexion",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erreur de connexion",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  const contextValue: AuthContextType = {
    user: isMounted ? user : null,
    login,
    logout,
    loading: isMounted ? loading : true,
    isAuthenticated: isMounted ? isAuthenticated : false,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");

  return ctx;
};