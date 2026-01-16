const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../utils/fileHandler");

const PRODUCTS_FILE = "./data/products.json";
const ORDERS_FILE = "./data/orders.json";
const NOTIFICATIONS_FILE = "./data/notifications.json";

// GET all orders
router.get("/", (req, res) => {
  const orders = readData(ORDERS_FILE);
  res.json(orders);
});

// CREATE order
router.post("/", (req, res) => {
  const { productId, quantity } = req.body;

  const products = readData(PRODUCTS_FILE);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (quantity > product.stock) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  // Reduce stock
  product.stock -= quantity;
  writeData(PRODUCTS_FILE, products);

  // Save order
  const orders = readData(ORDERS_FILE);
  orders.unshift({
    id: Date.now(),
    productId,
    productName: product.name,
    quantity,
    date: new Date()
  });
  writeData(ORDERS_FILE, orders);

  // Notifications
  const notifications = readData(NOTIFICATIONS_FILE);

  notifications.unshift({
    id: Date.now(),
    message: `Order placed for ${quantity} ${product.name}`,
    type: "success",
    time: new Date()
  });

  if (product.stock < 5) {
    notifications.unshift({
      id: Date.now() + 1,
      message: `Low stock alert for ${product.name}`,
      type: "warning",
      time: new Date()
    });
  }

  writeData(NOTIFICATIONS_FILE, notifications);

  res.status(201).json({ message: "Order created successfully" });
});

module.exports = router;
