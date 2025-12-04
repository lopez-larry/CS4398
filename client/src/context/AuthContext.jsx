/**
 * @file AuthContext.jsx
 * @description Provides authentication state and functions across the React app,
 * including GDPR/CCPA consent modal handling after login and reload.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import ConsentModal from '../components/legal/ConsentModal';
import { CONSENT_EXPIRY_DAYS } from '../constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [showConsentModal, setShowConsentModal] = useState(false);
  const [currentConsentVersion, setCurrentConsentVersion] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();

  if (axiosInstance && axiosInstance.defaults) {
    axiosInstance.defaults.withCredentials = true;
  }

  const hasExpiredConsent = (u) => {
    if (!u?.consent?.agreed) return true;
    if (!currentConsentVersion) return false;

    const consentDate = new Date(u.consent.timestamp);
    const now = new Date();
    const daysSinceConsent = (now - consentDate) / (1000 * 60 * 60 * 24);

    const versionMismatch = u.consent.consentVersion !== currentConsentVersion;
    return daysSinceConsent > CONSENT_EXPIRY_DAYS || versionMismatch;
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/user/current_user');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));

      if (res.data?.isVerified) {
        localStorage.removeItem('pendingEmail');
      }

      if (hasExpiredConsent(res.data)) {
        setShowConsentModal(true);
      }

      if (res.data && !res.data.isVerified) {
        navigate('/verify-required');
      }

      if (res.data?.role === 'admin') {
        const here = window.location.pathname;
        if (['/login', '/register'].includes(here)) {
          navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.message === 'Account not verified.') {
        navigate('/verify-required');
      } else if (err?.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('user');
        setToken(null);
      } else {
        console.error('Error fetching current user:', err);
      }
    } finally {
      setIsAuthChecked(true);
    }
  }, [navigate, currentConsentVersion]);

  const login = async (email, password, lastPath = null) => {
    try {
      const res = await axiosInstance.post('/user/login', { email, password });
      const data = res.data;

      setUser(data.user);
      setToken(data.token || null);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.token) localStorage.setItem('token', data.token);

      if (data.unverified) {
        localStorage.setItem('pendingEmail', data.user.email || email);
        navigate('/verify-required');
        return { unverified: true };
      }

      if (hasExpiredConsent(data.user)) {
        setShowConsentModal(true);
      }

      if (data.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (lastPath) {
        navigate(lastPath); // return to last attempted path if available
      } else {
        navigate('/'); // default for customers/breeders
      }

      return { unverified: false, user: data.user, token: data.token };
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/user/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        console.warn('Logout request failed with status:', res.status);
        throw new Error(`Server responded with ${res.status}`);
      }

      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('pendingEmail');

      return { success: true };
    } catch (err) {
      console.error('Logout failed:', err);

      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('pendingEmail');

      return { success: false, error: err.message || 'Logout failed' };
    }
  };

  const handleConsentAccept = async () => {
    try {
      const res = await axiosInstance.post('/user/give-consent', { agreed: true });
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setShowConsentModal(false);
    } catch (err) {
      console.error('Consent accept failed:', err);
    }
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
  };

  useEffect(() => {
    const fetchConsentVersion = async () => {
      try {
        const res = await axiosInstance.get('/policies/consent-version');
        setCurrentConsentVersion(res.data.version);
      } catch (err) {
        console.error('Failed to fetch consent version:', err);
        setCurrentConsentVersion('__unknown__');
      }
    };
    fetchConsentVersion();
  }, []);

  useEffect(() => {
    if (currentConsentVersion !== null) {
      fetchCurrentUser();
    }
  }, [currentConsentVersion, fetchCurrentUser]);

  return (
    <>
      <AuthContext.Provider
        value={{
          user,
          token,
          login,
          logout,
          setUser,
          isAuthChecked,
          isAdmin: !!user && user.role === 'admin',
          isVerified: !!user && !!user.isVerified,
          isPremium: !!user && !!user.premiumMember,
          refreshUser: fetchCurrentUser,
        }}
      >
        {children}
        <ConsentModal
          show={showConsentModal}
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      </AuthContext.Provider>
    </>
  );
};

export const useAuth = () => useContext(AuthContext);
