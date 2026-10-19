import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount from httpOnly cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await authService.getMe();
        setUser(data.user || data.data?.user || data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Listen for 401 events dispatched by API interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    const userData = data.user || data.data?.user || data;
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authService.register(formData);
    const userData = data.user || data.data?.user || data;
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the API call fails, clear local state
    }
    setUser(null);
  }, []);

  const updateUser = useCallback((data) => {
    setUser((prev) => (prev ? { ...prev, ...data } : data));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
