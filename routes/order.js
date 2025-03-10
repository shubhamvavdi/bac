const express = require("express");
const router = express.Router();
const { authenticateToken } = require("./userAuth"); // ✅ Fixed import
const mongoose = require("mongoose");
// const User = mongoose.model("user");
const Order = require("../models/Order");
const User = require("../models/User"); // correct, capital "U"


// Debugging: Check if authenticateToken is properly imported
console.log("authenticateToken:", typeof authenticateToken);

// Create Order
router.post("/create-order", authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const order = new Order({
      userId: id,
      books: req.body.books,
      totalAmount: req.body.totalAmount,
    });

    await order.save();
    res.status(200).json({ message: "Order created successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get Order by ID
router.get("/get-order-by-id/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    return res.json({ status: "success", data: order });
  } catch (err) {
    res.status(500).json({ message: "An error occurred" });
  }
});

// Get Order History
router.get("/get-order-history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await User.findById(userId).populate({
      path: "orders",
      populate: { path: "book" }
    });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const ordersData = userData.orders.reverse();
    const paginatedOrders = ordersData.slice(0, 10);
    return res.json({ status: "Success", data: paginatedOrders });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// Get All Orders
router.get("/get-all-orders", authenticateToken, async (req, res) => {
  try {
    const userData = await Order.find()
      .populate({ path: "book" })
      .populate({ path: "user" })
      .sort({ createdAt: -1 });

    return res.json({ status: "Success", data: userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// Update Order Status
router.put("/update-status/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: req.body.status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ status: "Success", message: "Status Updated Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
