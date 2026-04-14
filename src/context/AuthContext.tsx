import React, { createContext, useContext, useState } from 'react';
import { Session } from '../types';
import { AuthService } from '../services/authService';

interface AuthContextData {
  session: Session | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function useAuth(): AuthContextData {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const response = await AuthService.login({ username, password });
      setSession({
        token: response.data.token,
        user: response.data.user,
        loginAt: new Date(),
      });
      return true;
    } catch {
      return false;
    }
  }

  function logout() {
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
