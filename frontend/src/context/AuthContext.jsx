import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tasteai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('tasteai_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('tasteai_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('tasteai_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session expired, logging out');
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: loggedUser } = res.data;
    setToken(access_token);
    setUser(loggedUser);
    localStorage.setItem('tasteai_token', access_token);
    localStorage.setItem('tasteai_user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { access_token, user: registeredUser } = res.data;
    setToken(access_token);
    setUser(registeredUser);
    localStorage.setItem('tasteai_token', access_token);
    localStorage.setItem('tasteai_user', JSON.stringify(registeredUser));
    return registeredUser;
  };

  const updatePreferences = async (prefData) => {
    const res = await api.put('/users/preferences', prefData);
    if (user) {
      const updated = { ...user, preferences: res.data };
      setUser(updated);
      localStorage.setItem('tasteai_user', JSON.stringify(updated));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tasteai_token');
    localStorage.removeItem('tasteai_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, register, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
