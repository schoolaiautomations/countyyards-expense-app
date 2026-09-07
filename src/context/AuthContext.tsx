import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (userid: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'cy_auth_token_v1';
const VALID_USER_ID = 'countryyards2025';
const VALID_PASSWORD = 'founders123';

// Persistent cookie helpers for WebViews and browser restarts
const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

const checkHasActiveSession = (): boolean => {
  try {
    const localVal = localStorage.getItem(AUTH_STORAGE_KEY);
    if (localVal === 'true' || localVal === VALID_USER_ID) return true;

    const sessionVal = localStorage.getItem('cy_session_active');
    if (sessionVal === 'true') return true;

    // Cookie fallback for WebViews where localStorage might be cleared on app restart
    const cookieVal = getCookie(AUTH_STORAGE_KEY);
    if (cookieVal === 'true' || cookieVal === VALID_USER_ID) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem('cy_session_active', 'true');
      return true;
    }
  } catch {
    const cookieVal = getCookie(AUTH_STORAGE_KEY);
    if (cookieVal === 'true' || cookieVal === VALID_USER_ID) return true;
  }
  return false;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return checkHasActiveSession();
  });

  const [user, setUser] = useState<{ username: string } | null>(() => {
    return checkHasActiveSession() ? { username: VALID_USER_ID } : null;
  });

  const login = (userid: string, pass: string) => {
    const trimmedId = userid.trim();
    const trimmedPass = pass.trim();

    if (trimmedId === VALID_USER_ID && trimmedPass === VALID_PASSWORD) {
      setIsAuthenticated(true);
      setUser({ username: VALID_USER_ID });
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        localStorage.setItem('cy_session_active', 'true');
        localStorage.setItem('cy_user', VALID_USER_ID);
        setCookie(AUTH_STORAGE_KEY, 'true', 365);
        setCookie('cy_session_active', 'true', 365);
      } catch (e) {
        console.error('Failed to save session:', e);
      }
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Invalid User ID or Password. Please verify your credentials.' 
      };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('cy_session_active');
      localStorage.removeItem('cy_user');
      deleteCookie(AUTH_STORAGE_KEY);
      deleteCookie('cy_session_active');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
