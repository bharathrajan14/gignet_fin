import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { loginWithGoogleFirebase, sendPhoneOtpFirebase } from '../../../../shared/src/firebase';

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

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await loginWithGoogleFirebase('CUSTOMER');
      if (res.success) {
        localStorage.setItem('gignet_token', res.idToken);
        setUser({
          id: res.user.uid,
          role: 'CUSTOMER',
          fullName: res.user.displayName,
          email: res.user.email,
          photoURL: res.user.photoURL,
          provider: res.provider
        });
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.error('[AuthContext] Google Login Error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhoneOtp = async (phoneNumber) => {
    try {
      const res = await sendPhoneOtpFirebase(phoneNumber);
      return res;
    } catch (err) {
      console.error('[AuthContext] Phone OTP Error:', err);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('gignet_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, switchPersona, loginWithGoogle, loginWithPhoneOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
