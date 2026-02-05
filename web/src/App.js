import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./services/api";
import { useEffect, useState } from "react";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import CreateProduct from "./pages/CreateProduct";
import Orders from "./pages/Orders";
import CreateOrder from "./pages/CreateOrder";
import Sidebar from "./Components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Registration";
import ResetPassword from "./pages/ResetPass";
import CustomersPage from "./pages/CustomersPage";

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setIsAuth(authStatus);
      setLoading(false);
    };

    checkAuth();
    
    // Check auth on storage changes (like token expiration)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout with Sidebar (only for authenticated users)
const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No Sidebar */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated() ? <Login /> : <Navigate to="/orders" replace />
          } 
        />
        <Route 
          path="/reset" 
          element={
            !isAuthenticated() ? <ResetPassword /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/register" 
          element={
            !isAuthenticated() ? <Register /> : <Navigate to="/orders" replace />
          } 
        />

        {/* Protected Routes - With Sidebar Layout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <Navigate to="/" replace />
          } 
        />
        
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Orders />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <CustomersPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/create-order" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreateOrder />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Products />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/create" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreateProduct />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route - redirect to appropriate page */}
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated() ? "/orders" : "/login"} replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;