// components/ProtectedRoute.js
import { useEffect } from 'react';
import { isAuthenticated } from '../services/auth';

const ProtectedRoute = ({ children }) => {
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
    }
  }, []);

  if (!isAuthenticated()) {
    return null; // Or a loading spinner
  }

  return children;
};

export default ProtectedRoute;