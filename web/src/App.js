import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import CreateProduct from "./pages/CreateProduct";
import Orders from "./pages/Orders";
// Add this import
import CreateOrder from "./pages/CreateOrder";
import Sidebar from "./Components/Sidebar";

// Add this route inside your <Routes> component


function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/create" element={<CreateProduct />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/create-order" element={<CreateOrder />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
