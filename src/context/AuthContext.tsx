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

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

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

export function useAuth(): AuthContextData {
  return useContext(AuthContext);
}
