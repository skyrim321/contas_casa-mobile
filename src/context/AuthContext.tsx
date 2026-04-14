import React, { createContext, useContext, useState } from 'react';
import { generateSessionId } from '../utils/session';
import { DEMO_USERNAME, DEMO_PASSWORD } from '../config/auth';

interface Session {
  username: string;
  sessionId: string;
  loginAt: Date;
}

interface AuthContextData {
  session: Session | null;
  login: (username: string, password: string) => boolean;
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

  function login(username: string, password: string): boolean {
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      setSession({
        username,
        sessionId: generateSessionId(),
        loginAt: new Date(),
      });
      return true;
    }
    return false;
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
