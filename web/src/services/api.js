const BASE_URL = "http://localhost:5000/api";

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

export const getOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
};

export const createOrder = async (order) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });
  return res.json();
};

export const getNotifications = async () => {
  const res = await fetch(`${BASE_URL}/notifications`);
  return res.json();
};
