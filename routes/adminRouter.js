const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 }).lean();

    const currentAdminId = req.session && req.session.user ? req.session.user.id : null;
    const adminName = req.session && req.session.user ? req.session.user.username : "Admin";

    res.render("admin", { users, currentAdminId, adminName });
  } catch (err) {
    console.error("Admin panel error:", err);
    res.status(500).send("Server error");
  }
});

router.post("/promote", async (req, res) => {
  try {
    console.log(req.body)
    const { id } = req.body;
    if (!id) return res.status(400).json({ ok: false, message: "Missing id" });
    await User.findByIdAndUpdate(id, { roles: "ADMIN" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("Promote error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

router.post("/demote", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ ok: false, message: "Missing id" });
    if (req.session.user.id === id) {
      return res.status(400).json({ ok: false, message: "Can't demote yourself" });
    }
    await User.findByIdAndUpdate(id, { roles: "USER" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("Demote error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

router.post("/delete", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ ok: false, message: "Missing id" });
    if (req.session.user.id === id) {
      return res.status(400).json({ ok: false, message: "Can't delete yourself" });
    }
    await User.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

module.exports = router;
