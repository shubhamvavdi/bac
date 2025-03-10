require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();

// ✅ MongoDB Connection

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  });

// ✅ Allowed Origins List
const allowedOrigins = [
  "https://bac-1-b2m2.onrender.com",  // Add your production frontend URL here
  process.env.CORS_ORIGIN,           // From .env
  process.env.CORS_ALLOW_ORIGIN     // From .env
].filter(Boolean); // Remove any empty or falsy values from the list

app.use((req, res, next) => {
  console.log(`🌐 Incoming request from: ${req.headers.origin}`);
  next();
});

// ✅ CORS Middleware
app.use(cors({
  origin: (origin, callback) => {
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

// ✅ Preflight OPTIONS Request Handling
app.options("*", (req, res) => res.sendStatus(200));

// ✅ Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// ✅ JWT Authentication Middleware
const { authenticateToken } = require("./Middleware/authMiddleware");

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

// ✅ Root Route
app.get("/", (req, res) => res.send("🚀 Welcome to the Bookstore API"));

// ✅ 404 Route Handler for Unmatched Routes
app.use((req, res) => res.status(404).json({ message: "❌ Route not found" }));

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
