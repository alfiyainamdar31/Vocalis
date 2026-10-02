const express = require("express");
const cors = require("cors");
const path = require("path");
const { CORS_ORIGIN } = require("./config/env.js");

const app = express();

app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN }));

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
