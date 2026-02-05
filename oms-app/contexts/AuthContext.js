// contexts/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import * as api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthentication = async () => {
    try {
      const authenticated = await api.isAuthenticated();
      setIsAuthenticated(authenticated);
      return authenticated;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const result = await api.login(email, password);
      if (result.success) {
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
  };

  const handleRegister = async (userData) => {
    try {
      return await api.register(userData);
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        checkAuthentication,
        handleLogin,
        handleLogout,
        handleRegister
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};