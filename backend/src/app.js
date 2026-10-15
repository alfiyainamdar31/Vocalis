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
      if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ""))) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

module.exports = app;
