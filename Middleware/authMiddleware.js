const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  try {
    // ✅ **Correct Way to Extract Token**
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    console.log("Token Found:", token); // ✅ Debugging માટે Inspect કરો

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // ✅ **Verify JWT Token**
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ **Find User Without Password**
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // **Pass user data in req.user**
    next();
  } catch (error) {
    console.error("JWT Verification Failed:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authenticateToken };
