const BASE_URL = "http://localhost:3001";

/* -------------------- HELPERS -------------------- */

// Generate unique 5-digit order ID
const generateOrderId = (existingIds) => {
  let id;
  do {
    id = Math.floor(10000 + Math.random() * 90000);
  } while (existingIds.includes(id));
  return id;
};

// Get today’s date (YYYY-MM-DD)
const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

/* -------------------- PRODUCTS -------------------- */

export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
};

export const createProduct = async (product) => {
  return fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
};

export const updateProduct = async (id, updatedData) => {
  return fetch(`${BASE_URL}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
};

export const deleteProduct = async (id) => {
  return fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
  });
};

/* -------------------- ORDERS -------------------- */

export const getOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
};

export const createOrder = async ({ customerName, items }) => {
  // Fetch existing orders to avoid ID collision
  const ordersRes = await fetch(`${BASE_URL}/orders`);
  const orders = await ordersRes.json();

  const newOrder = {
    id: generateOrderId(orders.map((o) => o.id)),
    customerName,
    items,
    totalPrice: items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
    status: "pending",
    date: getTodayDate(),
  };

  return fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newOrder),
  });
};

export const updateOrder = async (id, updatedData) => {
  return fetch(`${BASE_URL}/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
};

export const deleteOrder = async (id) => {
  return fetch(`${BASE_URL}/orders/${id}`, {
    method: "DELETE",
  });
};
