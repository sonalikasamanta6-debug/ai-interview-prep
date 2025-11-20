// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
  roles: { type: String, default: "USER" }, // 'USER' or 'ADMIN'
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
