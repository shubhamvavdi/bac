const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Favourite = require("../models/Favourite");
const { authenticateToken } = require("../Middleware/authMiddleware");

// ✅ **Add book to favourites**
router.post("/add-book-to-favourite", authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id; // **Authenticate Middleware Correctly Passes User ID**

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    // **Check if book is already in favourites**
    const existingFav = await Favourite.findOne({ userId, bookId });
    if (existingFav) {
      return res.status(409).json({ message: "Book is already in favourites" });
    }

    // **Add to favourites**
    const newFavourite = new Favourite({ userId, bookId });
    await newFavourite.save();

    return res.status(201).json({ message: "Added to favourites", favourite: newFavourite });
  } catch (error) {
    console.error("❌ Error adding to favourites:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ **Remove book from favourites**
router.delete("/remove-book-from-favourite", authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    await Favourite.findOneAndDelete({ userId, bookId });

    return res.status(200).json({ message: "Book removed from favourites" });
  } catch (error) {
    console.error("❌ Error removing book:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

router.get("/get-favourite-books", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // ✅ Populate book details
    const favourites = await Favourite.find({ userId }).populate("bookId");

    console.log("Fetched Favourites:", favourites); // Debugging

    if (!favourites.length) {
      return res.status(404).json({ message: "No Favourite Books Found" });
    }

    res.json({ favourites });
  } catch (error) {
    console.error("Error fetching favourite books:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
