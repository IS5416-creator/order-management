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

// CREATE order - FIXED VERSION
router.post("/", (req, res) => {
  const { productId, quantity, customerName } = req.body; // Changed from 'customer' to 'customerName'

  console.log("📦 Creating order with data:", req.body); // Debug log

  const products = readData(PRODUCTS_FILE);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (quantity > product.stock) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  // FIX: Calculate total price
  const total = quantity * (product.price || 0); // Added price calculation
  
  // Reduce stock
  product.stock -= quantity;
  writeData(PRODUCTS_FILE, products);

  // Save order - FIXED: Include ALL fields
  const orders = readData(ORDERS_FILE);
  
  const newOrder = {
    id: Date.now(), // Simple ID
    productId,
    productName: product.name,
    quantity,
    customerName: customerName || "Anonymous", // Use customerName
    total: total, // Include calculated total
    status: "Pending",
    date: new Date().toISOString()
  };
  
  console.log("💾 Saving order:", newOrder); // Debug log
  
  orders.unshift(newOrder);
  writeData(ORDERS_FILE, orders);

  // Notifications
  const notifications = readData(NOTIFICATIONS_FILE);
  notifications.unshift({
    id: Date.now(),
    message: `Order placed for ${quantity} ${product.name}`,
    type: "success",
    time: new Date().toISOString()
  });

  if (product.stock < 5) {
    notifications.unshift({
      id: Date.now() + 1,
      message: `Low stock alert for ${product.name}`,
      type: "warning",
      time: new Date().toISOString()
    });
  }

  writeData(NOTIFICATIONS_FILE, notifications);

  res.status(201).json({ 
    message: "Order created successfully",
    order: newOrder // Return the complete order
  });
});

// UPDATE order status
router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  const orderId = parseInt(req.params.id);
  
  const orders = readData(ORDERS_FILE);
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({ message: "Order not found" });
  }
  
  // Update status
  orders[orderIndex].status = status;
  writeData(ORDERS_FILE, orders);
  
  res.json({ 
    message: "Order status updated successfully",
    order: orders[orderIndex]
  });
});

module.exports = router;