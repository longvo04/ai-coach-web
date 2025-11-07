import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { AuthContext } from './AuthContextValue';

function extractBearer(raw) {
  if (!raw) return '';
  const str = String(raw);
  return str.startsWith('Bearer ') ? str.slice(7) : str;
}

function findTokenFromResponse(resp) {
  const { data, headers } = resp || {};
  const candidates = [
    data?.token,
    data?.accessToken,
    data?.access_token,
    data?.jwt,
    data,
  ].filter(Boolean);
  if (headers?.authorization) candidates.unshift(headers.authorization);
  // pick first string-looking candidate, strip Bearer
  for (const c of candidates) {
    if (typeof c === 'string') return extractBearer(c);
  }
  // try nested shapes
  try {
    const maybe = JSON.stringify(data);
    const match = maybe.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    if (match) return match[0];
  } catch {
    // ignore
  }
  return '';
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const resp = await axiosClient.post('/auth/login', { username, password });
      const receivedToken = findTokenFromResponse(resp);
      if (!receivedToken) throw new Error('No token returned from server');
      setToken(receivedToken);
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const t = token;
    setToken('');
    setUser(null);
    try {
      if (t) await axiosClient.post('/auth/logout', { token: t });
    } catch {
      // ignore
    }
  }, [token]);

  const loadMyInfo = useCallback(async () => {
    if (!token) return null;
    const { data } = await axiosClient.get('/users/myInfo');
    setUser(data.result);
    return data;
  }, [token]);

  useEffect(() => {
    if (token) {
      loadMyInfo().catch(() => {});
    } else {
      setUser(null);
    }
  }, [token, loadMyInfo]);

  const value = useMemo(() => ({ token, user, loading, login, logout, loadMyInfo }), [token, user, loading, login, logout, loadMyInfo]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}



