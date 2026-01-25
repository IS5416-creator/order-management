import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getCustomers, createOrder } from "../services/api";
import "../styles/main.css";

function CreateOrder() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    items: [{ productId: "", quantity: 1 }]
  });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersData, productsData] = await Promise.all([
        getCustomers(),
        getProducts(),
      ]);
      setCustomers(customersData || []);
      setProducts(productsData || []);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please check if backend is running.");
      setCustomers([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: customer.name,
      customerEmail: customer.email || "",
      customerPhone: customer.phone || ""
    }));
    setShowNewCustomerForm(false);
  };

  const handleNewCustomerChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProductChange = (index, productId) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], productId };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleQuantityChange = (index, quantity) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], quantity: parseInt(quantity) || 1 };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      setError("At least one item is required");
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const getSelectedProduct = (productId) => {
    return products.find(p => p._id === productId || p.id === productId);
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const product = getSelectedProduct(item.productId);
      if (product && product.price) {
        return total + (product.price * (item.quantity || 1));
      }
      return total;
    }, 0);
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      setError("Customer name is required");
      return false;
    }
    if (formData.items.length === 0) {
      setError("At least one product is required");
      return false;
    }
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.productId) {
        setError(`Please select a product for item ${i + 1}`);
        return false;
      }
      if (!item.quantity || item.quantity < 1) {
        setError(`Quantity must be at least 1 for item ${i + 1}`);
        return false;
      }
      const product = getSelectedProduct(item.productId);
      if (product && item.quantity > product.stock) {
        setError(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateForm()) return;
    setLoading(true);
    try {
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          productName: getSelectedProduct(item.productId)?.name || ""
        }))
      };
      const result = await createOrder(orderData);
      if (result.success) {
        setSuccess(result.message || "Order created successfully!");
        setFormData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          items: [{ productId: "", quantity: 1 }]
        });
        await getProducts().then(setProducts);
        setTimeout(() => {
          navigate("/orders");
        }, 2000);
      } else {
        setError(result.error || "Failed to create order");
      }
    } catch (err) {
      console.error("Error creating order:", err);
      setError(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const safeFormatPrice = (price) => {
    if (price === null || price === undefined) return "0.00";
    try {
      const num = Number(price);
      return isNaN(num) ? "0.00" : num.toFixed(2);
    } catch {
      return "0.00";
    }
  };

  const isLowStock = (product) => {
    return product && product.stock < 5;
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Create New Order</h1>
        <button className="btn-secondary" onClick={() => navigate("/orders")} disabled={loading}>
          ← Back to Orders
        </button>
      </div>

      {error && <div className="alert alert-error"><strong>Error:</strong> {error}</div>}
      {success && <div className="alert alert-success"><strong>Success:</strong> {success}</div>}

      <div className="card create-order-card">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>1. Customer Information</h3>
            
            {!showNewCustomerForm ? (
              <>
                <div className="form-group">
                  <label>Select Existing Customer</label>
                  <select
                    value=""
                    onChange={(e) => {
                      const customer = customers.find(c => (c._id || c.id) === e.target.value);
                      if (customer) handleCustomerSelect(customer);
                    }}
                    disabled={loading || customers.length === 0}
                  >
                    <option value="">{loading ? "Loading..." : "Select a customer"}</option>
                    {customers.map((customer) => (
                      <option key={customer._id || customer.id} value={customer._id || customer.id}>
                        {customer.name} ({customer.email || "No email"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <button type="button" className="btn-secondary" onClick={() => setShowNewCustomerForm(true)} disabled={loading}>
                    + Create New Customer
                  </button>
                </div>

                {formData.customerName && (
                  <div className="selected-info">
                    <p><strong>Selected Customer:</strong> {formData.customerName}</p>
                    {formData.customerEmail && <p><strong>Email:</strong> {formData.customerEmail}</p>}
                    {formData.customerPhone && <p><strong>Phone:</strong> {formData.customerPhone}</p>}
                  </div>
                )}
              </>
            ) : (
              <div className="new-customer-form">
                <h4>New Customer Details</h4>
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleNewCustomerChange} placeholder="Enter customer name" required disabled={loading} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleNewCustomerChange} placeholder="Enter email (optional)" disabled={loading} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleNewCustomerChange} placeholder="Enter phone (optional)" disabled={loading} />
                  </div>
                </div>
                <div className="form-actions-horizontal">
                  <button type="button" className="btn-secondary" onClick={() => {
                    setShowNewCustomerForm(false);
                    setFormData(prev => ({ ...prev, customerName: "", customerEmail: "", customerPhone: "" }));
                  }} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>2. Order Items</h3>
            {formData.items.map((item, index) => (
              <div key={index} className="order-item-row">
                <div className="item-header">
                  <h4>Item #{index + 1}</h4>
                  {formData.items.length > 1 && (
                    <button type="button" className="btn-danger btn-small" onClick={() => removeItem(index)} disabled={loading}>Remove</button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Product *</label>
                    <select value={item.productId} onChange={(e) => handleProductChange(index, e.target.value)} required disabled={loading || products.length === 0}>
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product._id || product.id} value={product._id || product.id}>
                          {product.name} - {safeFormatPrice(product.price)} ETB ({product.stock || 0} in stock)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input type="number" min="1" max={getSelectedProduct(item.productId)?.stock || 1} value={item.quantity} onChange={(e) => handleQuantityChange(index, e.target.value)} required disabled={loading || !item.productId} />
                    {item.productId && <small className="quantity-hint">Max: {getSelectedProduct(item.productId)?.stock || 0} available</small>}
                  </div>
                </div>

                {item.productId && (
                  <div className="selected-info">
                    <div className="product-details-grid">
                      <div>
                        <p><strong>Product:</strong> {getSelectedProduct(item.productId)?.name}</p>
                        <p><strong>Price:</strong> {safeFormatPrice(getSelectedProduct(item.productId)?.price)} ETB</p>
                      </div>
                      <div>
                        <p><strong>Category:</strong> {getSelectedProduct(item.productId)?.category || "N/A"}</p>
                        <p><strong>Stock:</strong> <span className={isLowStock(getSelectedProduct(item.productId)) ? "stock-low" : "stock-ok"}>{getSelectedProduct(item.productId)?.stock || 0} units</span></p>
                      </div>
                    </div>
                    {isLowStock(getSelectedProduct(item.productId)) && <div className="warning-message">⚠️ <strong>Low Stock Alert:</strong> Only {getSelectedProduct(item.productId)?.stock} left</div>}
                  </div>
                )}
              </div>
            ))}
            <div className="form-group">
              <button type="button" className="btn-secondary" onClick={addItem} disabled={loading}>+ Add Another Item</button>
            </div>
          </div>

          <div className="form-section">
            <h3>3. Order Summary</h3>
            <div className="order-summary">
              <div className="summary-row">
                <span>Customer:</span>
                <span>{formData.customerName || "Not selected"}</span>
              </div>
              <div className="summary-items">
                <h5>Items:</h5>
                {formData.items.map((item, index) => (
                  <div key={index} className="summary-item">
                    <span>• {getSelectedProduct(item.productId)?.name || "Not selected"}</span>
                    <span>{item.quantity || 1} × {safeFormatPrice(getSelectedProduct(item.productId)?.price)} ETB = {safeFormatPrice((getSelectedProduct(item.productId)?.price || 0) * (item.quantity || 1))} ETB</span>
                  </div>
                ))}
              </div>
              <div className="summary-row total-row">
                <span><strong>Total Price:</strong></span>
                <span><strong>{safeFormatPrice(calculateTotal())} ETB</strong></span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate("/orders")} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !formData.customerName || formData.items.some(item => !item.productId)}>
              {loading ? "Creating Order..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrder;
