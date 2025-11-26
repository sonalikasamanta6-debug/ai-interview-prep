const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");

const PORT = process.env.PORT || 9879;
const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET || "yourSecretKey"));

app.use(session({
  secret: process.env.SESSION_SECRET || "yourSecretKey",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

function isUserAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect("/auth");
}
function isAdminAuthenticated(req, res, next) {
  if (req.session && req.session.user && req.session.user.roles === "ADMIN") return next();
  res.redirect("/auth");
}
function redirectIfLoggedIn(req, res, next) {
  if (req.session && req.session.user) return res.redirect("/user");
  next();
}

app.get("/", (req, res) => {
  if (req.session && req.session.user) return res.redirect("/user");
  res.render("index");
});

app.get("/auth", redirectIfLoggedIn, (req, res) => {
  const { logout, success } = req.query;
  let message = null;
  if (logout) message = "👋 Logged out successfully!";
  else if (success) message = "🎉 Account created! Please login.";
  res.render("login", { message });
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.render("login", { message: "No user found with that email." });

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) return res.render("login", { message: "Invalid email or password." });

    req.session.user = {
      id: user._id.toString(),
      username: user.name || user.email,
      email: user.email,
      roles: user.roles || "USER"
    };

    console.log("Logged in:", req.session.user.username, "| role:", req.session.user.roles);

    
    if (req.session.user.roles === "ADMIN") return res.redirect("/admin");
    return res.redirect("/user");
  } catch (err) {
    console.error(err);
    return res.status(500).render("login", { message: "Server error during login." });
  }
});

// signup
app.post("/signup", async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const exist = await User.findOne({ email });
    if (exist) return res.render("login", { message: "Email already exists." });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, phone, roles: "USER" });
    await user.save();
    return res.redirect("/auth?success=true");
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

// logout
app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.redirect("/user");
    }
    res.clearCookie("connect.sid");
    res.redirect("/auth?logout=1");
  });
});

app.get("/user", isUserAuthenticated, (req, res) => {
  const name = req.session.user ? req.session.user.username : "User";
  res.render("dashboard", { name, user: req.session.user });
});


app.use("/user", isUserAuthenticated, userRouter);
app.use("/admin", isAdminAuthenticated, adminRouter);

app.get("/ai", isUserAuthenticated, (req, res) => res.render("ai"));
app.get("/data", isUserAuthenticated, (req, res) => res.render("data"));
app.get("/electronics", isUserAuthenticated, (req, res) => res.render("electronics"));

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/aipreparationdatabase";
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("MongoDB connected");
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      const hashed = await bcrypt.hash("admin123", 10);
      await new User({
        name: "Ms.Admin",
        email: "admin@gmail.com",
        password: hashed,
        phone: "9898989898",
        roles: "ADMIN"
      }).save();
      console.log("Default admin created: admin@gmail.com / admin123");
    }
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  }).catch(err => console.error("Mongo error:", err));
