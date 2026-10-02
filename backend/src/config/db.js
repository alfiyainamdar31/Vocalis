const mongoose = require("mongoose");
const { MONGODB_URI } = require("./env.js");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = true;
    console.log("MongoDB connected");

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
