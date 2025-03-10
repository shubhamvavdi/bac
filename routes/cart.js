const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../Middleware/authMiddleware");
const Cart = require("../models/Cart"); // 👈 "Cart" should be correct here (check the model name)

// ✅ 1️⃣ Add to Cart
router.post("/add-to-cart", authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id; // Get User ID from JWT

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const bookIndex = cart.items.findIndex((item) => item.bookId.toString() === bookId);

    if (bookIndex > -1) {
      cart.items[bookIndex].quantity += 1; // Increase quantity
    } else {
      cart.items.push({ bookId, quantity: 1 });
    }

    await cart.save();
    res.json({ status: "✅ Success", message: "📦 Book added to cart", cart });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    res.status(500).json({ message: "⚠️ An error occurred", error: error.message });
  }
});

// ✅ 2️⃣ Remove from Cart
router.put("/remove-from-cart/:bookId", authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "❌ Cart not found" });

    cart.items = cart.items.filter((item) => item.bookId.toString() !== bookId);

    await cart.save();
    res.json({ status: "✅ Success", message: "📦 Book removed from cart", cart });
  } catch (error) {
    console.error("❌ Error removing from cart:", error);
    res.status(500).json({ message: "⚠️ An error occurred", error: error.message });
  }
});

// ✅ 3️⃣ Get User Cart
router.get("/get-user-cart", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ JWT Middleware થી મળેલું User ID
    
    if (!userId) {
      return res.status(400).json({ status: "Error", message: "Unauthorized ❌" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.bookId");

    if (!cart) {
      return res.status(404).json({ status: "Error", message: "Cart not found ❌" });
    }

    // ✅ Cart Data Format કરો
    const cartItems = cart.items.map((item) => ({
      _id: item.bookId._id,
      title: item.bookId.title,
      author: item.bookId.author,
      price: item.bookId.price,
      image: item.bookId.image,
      quantity: item.quantity,
    }));

    res.status(200).json({ status: "Success", data: cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
});


// 🛒 Clear Cart API
router.delete("/clear-cart", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // authenticateToken Middleware થી મળેલો userId

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    await CartModel.findOneAndUpdate(
      { userId },
      { $set: { items: [] } }, // કાર્ટ ખાલી કરો
      { new: true }
    );

    res.json({ message: "Cart cleared successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;



module.exports = router;
