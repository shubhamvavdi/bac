const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/bookstore";

async function connectDB(retries = 5) {
  while (retries) {
    try {
      await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log("✅ MongoDB Connected");
      break; // આંસુચિત ખોટી લાઈન દૂર કરી
    } catch (error) {
      console.error(`❌ MongoDB Connection Failed. Retries left: ${retries - 1}, Error: ${error.message}`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000)); // 5 seconds wait before retry
    }
  }
  if (!retries) process.exit(1);
}

connectDB();
