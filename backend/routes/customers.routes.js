const express = require("express");
const router = express.Router();
const { readData } = require("../utils/fileHandler");

const CUSTOMERS_FILE = "./data/customers.json";


// Add this to your existing customers.routes.js file
const { writeData } = require("../utils/fileHandler");

// POST create new customer
router.post("/", (req, res) => {
  const { name, email, phone } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: "Customer name is required" });
  }
  
  const customers = readData(CUSTOMERS_FILE);
  
  // Check if customer already exists
  const existingCustomer = customers.find(c => 
    c.email === email || c.name.toLowerCase() === name.toLowerCase()
  );
  
  if (existingCustomer) {
    return res.status(400).json({ 
      message: "Customer with this name or email already exists" 
    });
  }
  
  // Create new customer
  const newCustomer = {
    id: Date.now(), // Simple ID generation
    name,
    email: email || "",
    phone: phone || ""
  };
  
  customers.push(newCustomer);
  writeData(CUSTOMERS_FILE, customers);
  
  res.status(201).json({
    message: "Customer created successfully",
    customer: newCustomer
  });
});


// GET all customers
router.get("/", (req, res) => {
  const customers = readData(CUSTOMERS_FILE);
  res.json(customers);
});

// GET single customer by ID
router.get("/:id", (req, res) => {
  const customers = readData(CUSTOMERS_FILE);
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  
  res.json(customer);
});

module.exports = router;