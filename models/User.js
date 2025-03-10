const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 4,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  favourites: [
    {
      bookId: String,
      title: String,
      author: String,
      url: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
