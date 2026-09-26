import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export const homeFor = (user) => (user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/provider' : '/');

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    api.get('/auth/me')
      .then((r) => alive && setUser(r.data.user))
      .catch(() => alive && setUser(null))
      .finally(() => alive && setReady(true));
    return () => { alive = false; };
  }, []);

  // Fired by the API client when the server says the session expired / account was disabled.
  useEffect(() => {
    const onExpired = (e) => {
      setUser((u) => {
        if (u) toast.warning(e.detail?.message || 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
        return null;
      });
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [toast]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (values) => {
    const res = await api.post('/auth/register', values);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* cookie may already be gone */ }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, login, register, logout, setUser }), [user, ready, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
