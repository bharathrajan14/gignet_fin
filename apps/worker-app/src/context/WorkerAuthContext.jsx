import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { loginWithGoogleFirebase, sendPhoneOtpFirebase } from '../../../../shared/src/firebase';

const WorkerAuthContext = createContext();

export function WorkerAuthProvider({ children }) {
  const [workerUser, setWorkerUser] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const initWorkerAuth = async () => {
    try {
      const savedToken = localStorage.getItem('gignet_worker_token');
      if (savedToken) {
        const res = await api.get('/worker/profile');
        if (res.data.success) {
          setWorkerProfile(res.data.data.worker);
          setWorkerUser(res.data.data.worker.userId);
          setLoading(false);
          return;
        }
      }
      // Default to Suresh Kumar (Balanced Plumber) for instant demo
      await switchWorkerPersona('worker-suresh');
    } catch (err) {
      console.warn('[WorkerAuth] Falling back to default Suresh persona:', err.message);
      await switchWorkerPersona('worker-suresh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initWorkerAuth();
  }, []);

  const switchWorkerPersona = async (persona) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/demo-switch', { persona });
      if (res.data.success) {
        localStorage.setItem('gignet_worker_token', res.data.token);
        const profileRes = await api.get('/worker/profile');
        if (profileRes.data.success) {
          setWorkerProfile(profileRes.data.data.worker);
          setWorkerUser(profileRes.data.data.worker.userId);
        }
      }
    } catch (err) {
      console.error('[WorkerAuth] Switch persona error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await loginWithGoogleFirebase('WORKER');
      if (res.success) {
        localStorage.setItem('gignet_worker_token', res.idToken);
        setWorkerUser(res.user.uid);
        setWorkerProfile((prev) => ({
          ...prev,
          fullName: res.user.displayName,
          email: res.user.email
        }));
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.error('[WorkerAuthContext] Google Login Error:', err);
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
      console.error('[WorkerAuthContext] Phone OTP Error:', err);
      return { success: false, error: err.message };
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/worker/profile');
      if (res.data.success) {
        setWorkerProfile(res.data.data.worker);
      }
    } catch (err) {
      console.error('[WorkerAuth] Error refreshing profile:', err);
    }
  };

  return (
    <WorkerAuthContext.Provider value={{ workerUser, workerProfile, loading, switchWorkerPersona, loginWithGoogle, loginWithPhoneOtp, refreshProfile }}>
      {children}
    </WorkerAuthContext.Provider>
  );
}

export const useWorkerAuth = () => useContext(WorkerAuthContext);
