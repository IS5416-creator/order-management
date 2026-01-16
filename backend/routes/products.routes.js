const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../utils/fileHandler");

const PRODUCTS_FILE = "./data/products.json";
const NOTIFICATIONS_FILE = "./data/notifications.json";

// GET all products
router.get("/", (req, res) => {
  const products = readData(PRODUCTS_FILE);
  res.json(products);
});

// CREATE product
router.post("/", (req, res) => {
  const { name, price, stock } = req.body;

  if (!name || price < 0 || stock < 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  const products = readData(PRODUCTS_FILE);

  const newProduct = {
    id: Date.now(),
    name,
    price,
    stock
  };

  products.push(newProduct);
  writeData(PRODUCTS_FILE, products);

  // Notification
  const notifications = readData(NOTIFICATIONS_FILE);
  notifications.unshift({
    id: Date.now(),
    message: `Product "${name}" created`,
    type: "info",
    time: new Date()
  });
  writeData(NOTIFICATIONS_FILE, notifications);

  res.status(201).json(newProduct);
});

module.exports = router;
