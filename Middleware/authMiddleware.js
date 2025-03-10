const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  try {
    // ✅ **Token Extraction from Headers & Cookies (for extra support)**
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies.token;
    
    console.log("🔍 Token Found:", token); // ✅ Debugging 

    if (!token) {
      console.log("🚫 No Token Provided!");
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // ✅ **Verify JWT Token**
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token Decoded:", decoded);

    // ✅ **Find User Without Password**
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("🚫 User Not Found!");
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // **Pass user data in req.user**
    next();
  } catch (error) {
    console.error("🚫 JWT Verification Failed:", error.message);
    
    // ✅ **Better Error Messages**
    const errorMessage = error.name === "JsonWebTokenError"
      ? "Invalid Token"
      : error.name === "TokenExpiredError"
      ? "Token Expired"
      : "Authorization Error";

    res.status(401).json({ message: errorMessage });
  }
};

module.exports = { authenticateToken };
