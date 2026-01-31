import { Link, useLocation } from "react-router-dom";
import { authService } from "../services/auth";
import "../styles/main.css";

function Sidebar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const user = authService.getCurrentUser();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      authService.logout();
    }
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <span className="logo-icon">🛒</span>
        <span className="logo-text">Inventory</span>
      </div>
      
      <div className="nav-menu">
        <Link 
          to="/" 
          className={`nav-link ${isActive("/") ? "active" : ""}`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Dashboard</span>
        </Link>
        
        <Link 
          to="/products" 
          className={`nav-link ${isActive("/products") ? "active" : ""}`}
        >
          <span className="nav-icon">📦</span>
          <span className="nav-label">Products</span>
        </Link>
        
        <Link 
          to="/orders" 
          className={`nav-link ${isActive("/orders") ? "active" : ""}`}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">Orders</span>
        </Link>
        
        <Link 
          to="/create" 
          className={`nav-link ${isActive("/create") ? "active" : ""}`}
        >
          <span className="nav-icon">➕</span>
          <span className="nav-label">Create Product</span>
        </Link>
        
        <Link 
          to="/create-order" 
          className="create-order-btn"
        >
          <span className="btn-icon">⚡</span>
          <span className="btn-label">Create Order</span>
        </Link>
      </div>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <div className="user-name">{user?.name || user?.email || 'User'}</div>
            <div className="user-role">Admin Account</div>
          </div>
        </div>
        
        <button onClick={handleLogout} className="logout-btn">
          <span className="logout-icon">🚪</span>
          <span className="logout-label">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;