// server/src/config/env.js

require("dotenv").config();

const required = [
  "JWT_SECRET",
  "GEMINI_API_KEY",
  "MONGODB_URI",
  "EMAIL_USER",
  "EMAIL_PASS",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
}

module.exports = {
  PORT: process.env.PORT || 3002,

  JWT_SECRET: process.env.JWT_SECRET,

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  MONGODB_URI: process.env.MONGODB_URI,

  EMAIL_USER: process.env.EMAIL_USER,

  EMAIL_PASS: process.env.EMAIL_PASS,
};
