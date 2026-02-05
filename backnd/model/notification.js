const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: { type: String },
  type: { type: String },
  time: { type: Date },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
