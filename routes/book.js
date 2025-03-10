// routes/book.js
const express = require("express");
const router = express.Router();
const Book = require("../models/Book"); 
const mongoose = require("mongoose");

// ✅ Add a New Book
router.post("/add", async (req, res) => {
  console.log("📩 Request received at:", req.url);
  console.log("📝 Request Body:", req.body);
  try {
    if (!req.body.title || !req.body.author || !req.body.price) {
      return res.status(400).json({ message: "⚠️ Missing required fields" });
    }

    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json({ message: "✅ Book added successfully!", book: newBook });
  } catch (error) {
    console.error("❌ Error adding book:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ Fetch All Books
router.get("/all", async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    console.error("❌ Error fetching books:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Fetch Book by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "⚠️ Invalid Book ID" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: "❌ Book Not Found" });
    }

    res.json(book);
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
