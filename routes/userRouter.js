const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
  const name = req.session.user ? req.session.user.username : "User";
  res.render("dashboard", { name, user: req.session.user });
});

router.get("/ai", (req, res) => res.render("ai"));
router.get("/data", (req, res) => res.render("data"));
router.get("/electronics", (req, res) => res.render("electronics"));

module.exports = router;
