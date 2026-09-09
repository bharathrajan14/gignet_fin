import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAdminAuth = async () => {
    try {
      const savedToken = localStorage.getItem('gignet_admin_token');
      if (savedToken) {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setAdminUser(res.data.user);
          setLoading(false);
          return;
        }
      }
      // Default to Vikram Gowda (Coop Admin)
      await switchAdminPersona('admin');
    } catch (err) {
      console.warn('[AdminAuth] Falling back to default Admin persona:', err.message);
      await switchAdminPersona('admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAdminAuth();
  }, []);

  const switchAdminPersona = async (persona) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/demo-switch', { persona });
      if (res.data.success) {
        localStorage.setItem('gignet_admin_token', res.data.token);
        setAdminUser(res.data.user);
      }
    } catch (err) {
      console.error('[AdminAuth] Switch persona error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, switchAdminPersona }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
