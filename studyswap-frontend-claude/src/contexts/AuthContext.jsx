import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);
const unwrap = (r) => r?.data ?? r?.user ?? null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from the server (cookie). No client-side token storage.
  useEffect(() => {
    let alive = true;
    authService.me().then((r) => alive && setUser(unwrap(r))).catch(() => alive && setUser(null)).finally(() => alive && setLoading(false));
    const onUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => { alive = false; window.removeEventListener('auth:unauthorized', onUnauthorized); };
  }, []);

  const login = useCallback(async (payload) => {
    const u = unwrap(await authService.login(payload));
    setUser(u); return u;
  }, []);
  const register = useCallback(async (payload) => unwrap(await authService.register(payload)), []);
  const logout = useCallback(async () => {
    try { await authService.logout(); } finally { setUser(null); }
  }, []);
  const refresh = useCallback(async () => { const u = unwrap(await authService.me()); setUser(u); return u; }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, refresh, setUser, isAdmin: user?.role === 'admin' }), [user, loading, login, register, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
