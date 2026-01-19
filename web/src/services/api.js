const BASE_URL = "http://localhost:5000/api";

// === PRODUCTS ===
export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
};

export const createProduct = async (product) => {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  });
  return res.json();
};

// === CUSTOMERS ===
export const getCustomers = async () => {
  const res = await fetch(`${BASE_URL}/customers`);
  return res.json();
};

// === ORDERS ===
export const getOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
};

export const createOrder = async (orderData) => {
  console.log("🚀 API: Sending order data:", orderData);
  
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(orderData)
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  
  const result = await res.json();
  console.log("✅ API: Received response:", result);
  return result;
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return res.json();
};

// === NOTIFICATIONS ===
export const getNotifications = async () => {
  const res = await fetch(`${BASE_URL}/notifications`);
  return res.json();
};
// Add this to your api.js file
export const createCustomer = async (customer) => {
  const res = await fetch(`${BASE_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer)
  });
  return res.json();
};