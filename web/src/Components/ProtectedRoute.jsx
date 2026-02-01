import { useEffect } from 'react';
import { isAuthenticated } from '../services/auth';

const ProtectedRoute = ({ children }) => {
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
    }
  }, []);

  if (!isAuthenticated()) {
    return null; 
  }

  return children;
};

export default ProtectedRoute;