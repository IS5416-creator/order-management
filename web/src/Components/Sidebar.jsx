import { Link, useLocation } from "react-router-dom";
import "../styles/main.css";

function Sidebar() {
  const location = useLocation();
  
  // Check if current path matches link
  const isActive = (path) => {
    return location.pathname === path;
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
        
        {/* Create Order Button - Highlighted */}
        <Link 
          to="/create-order" 
          className="create-order-btn"
        >
          <span className="btn-icon">⚡</span>
          <span className="btn-label">Create Order</span>
        </Link>
      </div>
      
      {/* Optional: Notifications or User Info */}
      <div className="sidebar-footer">
        <div className="notification-badge">
          <span className="bell-icon">🔔</span>
          <span className="notification-count">3</span>
          
        </div>
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <div className="user-name">Admin</div>
            <div className="user-role">Store Manager</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;