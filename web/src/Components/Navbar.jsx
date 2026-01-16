import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="sidebar">
      <h2 className="logo">OMS</h2>

      <Link to="/">Dashboard</Link>
      <Link to="/products">Products</Link>
      <Link to="/create">Create Product</Link>
      <Link to="/orders">Orders</Link>
    </div>
  );
}

export default Navbar;
