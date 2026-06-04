'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { saveToken, removeToken, getToken } from '@/lib/auth';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  disclaimerAccepted: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => removeToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login({ email, password });
    saveToken(token);
    setUser(user);
  };

  const register = async (data: RegisterData) => {
    await authApi.register({
      ...data,
      disclaimerAccepted: String(data.disclaimerAccepted),
    });
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const deleteAccount = async () => {
    await authApi.deleteAccount();
    removeToken();
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    const { user: updated } = await authApi.updateProfile(data);
    setUser(updated);
  };

  const uploadAvatar = async (file: File) => {
    const { user: updated } = await authApi.uploadAvatar(file);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, deleteAccount, updateProfile, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
