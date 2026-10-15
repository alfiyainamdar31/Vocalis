const express = require("express");
const cors = require("cors");
const path = require("path");
const { CORS_ORIGIN } = require("./config/env.js");

const app = express();

app.use(express.json());

const allowedOrigins = (CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      const cleanOrigin = origin ? origin.replace(/\/+$/, "") : "";

      if (
        !origin ||
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.includes("localhost") ||
        cleanOrigin.includes("vocalis-5phy.onrender.com")
      ) {
        return callback(null, true);
      }

      console.log(`CORS blocked origin: ${origin}`);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(
  "/voice-previews",
  express.static(path.join(__dirname, "..", "assets", "voice-previews"), {
    maxAge: "7d",
    immutable: true,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "TTS api is running" });
});

app.use((req, res, next) => {
  if (req.path.includes("/api/auth/login")) {
    console.log("Login request received:", req.method, req.path);
    console.log("Request Body:", req.body);
  }
  next();
});

module.exports = app;
