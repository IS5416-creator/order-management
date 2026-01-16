import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import CreateProduct from "./pages/CreateProduct";
import Orders from "./pages/Orders";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/create" element={<CreateProduct />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
