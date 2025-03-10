const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticateToken } = require("../Middleware/authMiddleware");
const router = express.Router();

// ✅ GET Profile API
// router.get("/profile", authenticateToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json(user);
//   } catch (error) {
//     console.error("Server Error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });



router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favourites");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      favourites: user.favourites || [],
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ✅ Add Favourite Book Route
router.post("/favourite", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, title, author, url } = req.body; // Book Details

    if (!bookId) return res.status(400).json({ message: "Book ID is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Check if book already exists in favourites
    const isBookExists = user.favourites.some((book) => book.bookId === bookId);

    if (isBookExists) {
      return res.status(400).json({ message: "Book already in favourites" });
    }

    // ✅ Add book to favourites
    user.favourites.push({ bookId, title, author, url });
    await user.save();

    res.status(200).json({ message: "Book added to favourites", favourites: user.favourites });
  } catch (error) {
    console.error("❌ Error adding favourite:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ✅ Get Favourites List
router.get("/favourites", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("favourites");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.favourites);
  } catch (error) {
    console.error("❌ Error fetching favourites:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




// ✅ Fix user profile route
// router.get("/profile", authenticateToken, async (req, res) => {
//   try {
//     console.log("🔹 User ID from token:", req.user.id);

//     const user = await User.findById(req.user.id).select("-password"); // Exclude password

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({
//       name: user.name,
//       email: user.email,
//       profileImage: user.profileImage || "",
//       favourites: user.favourites || [],
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user profile:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });



// 📌 User Sign-Up API
router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

    if (!username || username.length < 4) {
      return res.status(400).json({ message: "Username must be at least 4 characters" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, address });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// 📌 User Sign-In API
router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




// 📌 Get All Users (Admin Only - Protected)
router.get("/get-users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





// 📌 Update User Address (Protected)
router.put("/update-address", authenticateToken, async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ message: "Address is required" });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { address }, { new: true });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Address updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// 📌 Delete User (Protected)
router.delete("/delete-user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
