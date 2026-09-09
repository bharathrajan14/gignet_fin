import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      const savedToken = localStorage.getItem('gignet_token');
      if (savedToken) {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setLoading(false);
          return;
        }
      }
      // Out of the box: switch to Customer Asha automatically for instant demo
      await switchPersona('customer');
    } catch (err) {
      console.warn('[Auth] Auto login fallback to customer persona:', err.message);
      await switchPersona('customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const switchPersona = async (persona) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/demo-switch', { persona });
      if (res.data.success) {
        localStorage.setItem('gignet_token', res.data.token);
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('[Auth] Failed to switch demo persona:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('gignet_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, switchPersona, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
