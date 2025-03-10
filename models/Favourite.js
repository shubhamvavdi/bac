const mongoose = require("mongoose");

const FavouriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
});

module.exports = mongoose.model("Favourite", FavouriteSchema);
