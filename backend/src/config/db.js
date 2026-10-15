const mongoose = require("mongoose");
const { MONGODB_URI } = require("./env.js");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const db = await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  isConnected = db.connections[0].readyState === 1;
  console.log("MongoDB connected successfully");
};

module.exports = { connectDB };
