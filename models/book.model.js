const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Book = mongoose.model("Book", bookSchema);  // ✅ Ensure "Book" matches your populate reference
module.exports = Book;
