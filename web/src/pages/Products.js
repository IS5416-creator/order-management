import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../services/api";
import ProductCard from "../Components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      
      const transformedProducts = (productsData || []).map(product => ({
        id: product._id || product.id,
        name: product.name || "Unnamed Product",
        description: product.description || "",
        price: product.price || 0,
        category: product.category || "Uncategorized",
        stock: product.stock || 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        image: product.image || null
      }));
      
      setProducts(transformedProducts);
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please check if backend is running.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteProduct(productId);
      
      if (result.success) {
        alert(`"${productName}" has been deleted successfully.`);
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        alert(result.error || "Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredAndSortedProducts = products
    .filter(product => {
      if (
        searchTerm &&
        !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "stock-low":
          return a.stock - b.stock;
        case "stock-high":
          return b.stock - a.stock;
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

  const inventoryStats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    outOfStock: products.filter(p => p.stock <= 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Products</h2>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>Products</h2>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchProducts} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2>Product Inventory</h2>
          <p className="page-subtitle">
            Total Products: <strong>{inventoryStats.totalProducts}</strong> | 
            Inventory Value: <strong>{inventoryStats.totalValue.toFixed(2)} ETB</strong> | 
            Low Stock: <strong>{inventoryStats.lowStock}</strong> | 
            Out of Stock: <strong>{inventoryStats.outOfStock}</strong>
          </p>
        </div>
        <div>
          <a href="/create" className="btn btn-primary">
            + Add New Product
          </a>
        </div>
      </div>
      
      <div className="product-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="search-clear"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort By:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="stock-low">Stock (Low to High)</option>
              <option value="stock-high">Stock (High to Low)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          
          <button 
            onClick={fetchProducts}
            className="btn btn-secondary"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {filteredAndSortedProducts.length === 0 ? (
        <div className="empty-state">
          {searchTerm || selectedCategory !== "all" ? (
            <>
              <p>No products found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <p>No products in inventory. Add your first product!</p>
              <a href="/create-product" className="btn btn-primary">
                Add First Product
              </a>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="products-grid">
            {filteredAndSortedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onDelete={() => handleDeleteProduct(product.id, product.name)}
              />
            ))}
          </div>
          
          <div className="products-summary">
            <p>
              Showing <strong>{filteredAndSortedProducts.length}</strong> of <strong>{products.length}</strong> products
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory !== "all" && ` in "${selectedCategory}"`}
            </p>
          </div>
        </>
      )}
      
      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .page-subtitle {
          color: #666;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .product-controls {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .search-box {
          margin-bottom: 15px;
          display: flex;
          gap: 10px;
        }
        
        .search-input {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .search-clear {
          padding: 10px 20px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .filter-controls {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .filter-group label {
          font-weight: 500;
          white-space: nowrap;
        }
        
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          min-width: 150px;
        }
        
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .products-summary {
          text-align: center;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
          color: #666;
          font-size: 14px;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #ddd;
        }
        
        .empty-state p {
          margin-bottom: 20px;
          color: #666;
        }
        
        .loading-container {
          text-align: center;
          padding: 40px;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .btn {
          display: inline-block;
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          text-decoration: none;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn-primary {
          background: #007bff;
        }
        
        .btn-secondary {
          background: #6c757d;
        }
        
        .btn:hover {
          opacity: 0.9;
        }
        
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
          }
          
          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-group {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Products;
