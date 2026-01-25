const express = require("express");
const router = express.Router();
const { readData } = require("../utils/fileHandler");

const NOTIFICATIONS_FILE = "./data/notifications.json";

router.get("/", (req, res) => {
  const notifications = readData(NOTIFICATIONS_FILE);
  res.json(notifications);
});

module.exports = router;
