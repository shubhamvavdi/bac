require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();

// ✅ Allowed Origins List (From .env)
const allowedOrigins = [
  "http://localhost:3000",
  process.env.CORS_ORIGIN,
  process.env.CORS_ALLOW_ORIGIN
].filter(Boolean); // Remove any undefined values

app.use((req, res, next) => {
  console.log(`🌐 Incoming request from: ${req.headers.origin}`);
  next();
});

// ✅ CORS Middleware (Fully Fixed)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked: ${origin}`);
      callback(new Error("CORS policy does not allow this origin"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Preflight OPTIONS Request Handling (CORS Fix)
app.options("*", (req, res) => {
  res.sendStatus(200);
});

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  });

// ✅ JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "❌ No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err.message);
      return res.status(403).json({ message: "❌ Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

// ✅ Import Routes
const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");
const orderRoutes = require("./routes/order");
const favouriteRoutes = require("./routes/favourites");
const cartRoutes = require("./routes/cart");

// ✅ Register Routes
app.use("/user", userRoutes);
app.use("/book", bookRoutes);
app.use("/orders", orderRoutes);
app.use("/favourites", favouriteRoutes);
app.use("/cart", cartRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Welcome to the Bookstore API");
});

// ✅ 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
