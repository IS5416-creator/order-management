import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getCustomers, createOrder } from "../services/api";
import "../styles/main.css";

function CreateOrder() {
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    customerId: "",
    productId: "",
    quantity: 1,
  });
  // Add this right after your state declarations, around line 32:
const safeFormatPrice = (price) => {
  if (price === null || price === undefined) return "0.00";
  try {
    const num = Number(price);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  } catch (error) {
    console.error("Error formatting price:", price, error);
    return "0.00";
  }
};

  // State for dropdown options
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // State for selected items
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // State for new customer form
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch customers and products on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([
        getCustomers(),
        getProducts(),
      ]);

      setCustomers(customersData);
      setProducts(productsData);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please check if backend is running.");
    }
  };

  // Handle customer selection
  const handleCustomerChange = (e) => {
    const value = e.target.value;

    if (value === "new") {
      setShowNewCustomerForm(true);
      setSelectedCustomer(null);
      setFormData((prev) => ({ ...prev, customerId: "" }));
    } else {
      const customerId = parseInt(value);
      const customer = customers.find((c) => c.id === customerId);

      setSelectedCustomer(customer);
      setShowNewCustomerForm(false);
      setFormData((prev) => ({ ...prev, customerId: customerId }));
    }
  };

  // Handle new customer input changes
  const handleNewCustomerChange = (e) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value,
    });
  };

  // Handle product selection
  const handleProductChange = (e) => {
    const productId = parseInt(e.target.value);

    if (isNaN(productId) || productId === 0) {
      setSelectedProduct(null);
      setFormData((prev) => ({ ...prev, productId: "" }));
      return;
    }

    const product = products.find((p) => p.id === productId);

    if (!product) {
      setError("Selected product not found");
      return;
    }

    setSelectedProduct(product);
    setError("");
    setFormData((prev) => ({
      ...prev,
      productId: productId,
      quantity: 1,
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setFormData((prev) => ({ ...prev, quantity: value }));
  };

  // ========== FIXED handleSubmit FUNCTION ==========
  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (!formData.customerId && !newCustomer.name) {
    alert("Please select or create a customer");
    return;
  }

  if (!formData.productId) {
    alert("Please select a product");
    return;
  }

  if (formData.quantity < 1) {
    alert("Quantity must be at least 1");
    return;
  }

  // Check stock availability
  if (selectedProduct && formData.quantity > selectedProduct.stock) {
    alert(`Insufficient stock! Only ${selectedProduct.stock} available.`);
    return;
  }

  setLoading(true);
  setError("");

  try {
    // Get the customer name (either from selected or new customer)
    const customerName = selectedCustomer
      ? selectedCustomer.name
      : newCustomer.name || "Anonymous";

    // Prepare order data
    const orderData = {
      productId: Number(formData.productId),
      quantity: Number(formData.quantity),
      customerName: customerName,
      // If it's a new customer, include the email and phone too
      ...(newCustomer.name && !selectedCustomer && {
        customerEmail: newCustomer.email || "",
        customerPhone: newCustomer.phone || ""
      })
    };

    console.log("📤 Sending order to backend:", orderData);

    // Send to backend
    const result = await createOrder(orderData);

    console.log("📥 Backend response:", result);

    if (result.message) {
      alert(result.message);
    } else {
      alert("Order created successfully!");
    }

    // Refresh customers list to include any new ones
    await fetchData();
    
    // Redirect to orders page
    navigate("/orders");
  } catch (err) {
    console.error("❌ Error creating order:", err);
    setError(err.message || "Failed to create order");
    alert(`Error: ${err.message || "Failed to create order"}`);
  } finally {
    setLoading(false);
  }
};
  // ========== END OF FIXED FUNCTION ==========

  // Calculate total price
  const calculateTotal = () => {
  if (!selectedProduct) return 0;
  try {
    const price = Number(selectedProduct.price);
    const quantity = Number(formData.quantity) || 1;
    return (isNaN(price) ? 0 : price) * quantity;
  } catch (error) {
    console.error("Error calculating total:", error);
    return 0;
  }
};

  // Check if product is low in stock
  const isLowStock = (product) => {
    return product && product.stock < 5;
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Create New Order</h1>
        <button
          className="btn-secondary"
          onClick={() => navigate("/orders")}
          disabled={loading}
        >
          ← Back to Orders
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="card create-order-card">
        <form onSubmit={handleSubmit}>
          {/* Customer Selection */}
          <div className="form-section">
            <h3>1. Select or Create Customer</h3>
            <div className="form-group">
              <label htmlFor="customer">Customer *</label>

              {!showNewCustomerForm ? (
                <>
                  <select
                    id="customer"
                    value={formData.customerId}
                    onChange={handleCustomerChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}{" "}
                        {customer.email ? `(${customer.email})` : ""}
                      </option>
                    ))}
                    <option value="new">➕ Add New Customer</option>
                  </select>

                  {selectedCustomer && (
                    <div className="selected-info">
                      <p>
                        <strong>Selected:</strong> {selectedCustomer.name}
                      </p>
                      {selectedCustomer.email && (
                        <p>
                          <strong>Email:</strong> {selectedCustomer.email}
                        </p>
                      )}
                      {selectedCustomer.phone && (
                        <p>
                          <strong>Phone:</strong> {selectedCustomer.phone}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="new-customer-form">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newCustomer.name}
                      onChange={handleNewCustomerChange}
                      placeholder="Enter customer name"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newCustomer.email}
                        onChange={handleNewCustomerChange}
                        placeholder="Enter email (optional)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={newCustomer.phone}
                        onChange={handleNewCustomerChange}
                        placeholder="Enter phone (optional)"
                      />
                    </div>
                  </div>

                  <div className="form-actions-horizontal">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setShowNewCustomerForm(false);
                        setNewCustomer({ name: "", email: "", phone: "" });
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-success"
                      onClick={() => {
                        if (newCustomer.name) {
                          setSelectedCustomer({
                            id: Date.now(),
                            name: newCustomer.name,
                            email: newCustomer.email,
                            phone: newCustomer.phone,
                          });
                          setFormData((prev) => ({
                            ...prev,
                            customerId: Date.now(),
                          }));
                          setShowNewCustomerForm(false);
                        } else {
                          alert("Please enter customer name");
                        }
                      }}
                      disabled={loading}
                    >
                      Save Customer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Selection */}
          {/* Product Selection */}
<div className="form-section">
  <h3>2. Select Product</h3>
  <div className="form-group">
    <label htmlFor="product">Product *</label>
    <select
      id="product"
      value={formData.productId}
      onChange={handleProductChange}
      required
      disabled={loading || products.length === 0}
    >
      <option value="">
        {products.length === 0
          ? "Loading products..."
          : "Select a product"}
      </option>
      {products.map((product) => (
        <option key={product.id} value={product.id}>
          {product.name} - ${safeFormatPrice(product.price)} (
          {product.stock || 0} in stock)
        </option>
      ))}
    </select>
    
    {selectedProduct && (
      <div className="selected-info">
        <div className="product-details-grid">
          <div>
            <p>
              <strong>Product:</strong> {selectedProduct.name}
            </p>
            <p>
              <strong>Category:</strong>{" "}
              {selectedProduct.category || "N/A"}
            </p>
          </div>
          <div>
            <p>
              <strong>Size:</strong> {selectedProduct.size || "N/A"}
            </p>
            <p>
              <strong>Color:</strong> {selectedProduct.color || "N/A"}
            </p>
          </div>
          <div>
            <p>
              <strong>Price:</strong> $
              {safeFormatPrice(selectedProduct.price)}
            </p>
            <p>
              <strong>Stock:</strong>
              <span
                className={
                  isLowStock(selectedProduct)
                    ? "stock-low"
                    : "stock-ok"
                }
              >
                {selectedProduct.stock || 0} units
              </span>
            </p>
          </div>
        </div>

        {isLowStock(selectedProduct) && (
          <div className="warning-message">
            ⚠️ <strong>Low Stock Alert:</strong> Only{" "}
            {selectedProduct.stock} left in stock
          </div>
        )}
      </div>
    )}
  </div>
</div>
          {/* Quantity Input */}
          <div className="form-section">
            <h3>3. Enter Quantity</h3>
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <div className="quantity-control">
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct ? selectedProduct.stock : 1}
                  value={formData.quantity}
                  onChange={handleQuantityChange}
                  required
                  disabled={loading || !selectedProduct}
                />
                <span className="quantity-hint">
                  {selectedProduct
                    ? `Max: ${selectedProduct.stock} units available`
                    : "Select a product first"}
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="form-section">
            <h3>4. Order Summary</h3>
            <div className="order-summary">
              <div className="summary-row">
                <span>Customer:</span>
                <span>
                  {selectedCustomer
                    ? selectedCustomer.name
                    : newCustomer.name || "Not selected"}
                </span>
              </div>
              <div className="summary-row">
                <span>Product:</span>
                <span>
                  {selectedProduct ? selectedProduct.name : "Not selected"}
                </span>
              </div>
              <div className="summary-row">
                <span>Unit Price:</span>
                <span>${selectedProduct ? safeFormatPrice(selectedProduct.price) : "0.00"}</span>
              </div>
              <div className="summary-row">
                <span>Quantity:</span>
                <span>{formData.quantity}</span>
              </div>
              <div className="summary-row total-row">
                <span>
                  <strong>Total Price:</strong>
                </span>
                <span>
                  <strong>${calculateTotal().toFixed(2)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/orders")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={
                loading ||
                (!formData.customerId && !newCustomer.name) ||
                !formData.productId
              }
            >
              {loading ? "Creating Order..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrder;
