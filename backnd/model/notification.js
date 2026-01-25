const mongoose = require("mongoose");

const clothSchema = new mongoose.Schema({
  message: { type: String },
  type: { type: String },
  time: { type: Date },
});

const Notification = mongoose.model("Notification", movieSchema);

module.exports = Notification;
