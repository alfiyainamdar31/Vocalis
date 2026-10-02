const express = require("express");
const {
  generateTTSController,
  getVoicesController,
} = require("../controllers/ttsController.js");
const { requireAuth } = require("../middleware/requireAuth.js");

const router = express.Router();

router.get("/tts/voices", getVoicesController);
router.post("/tts/generate", requireAuth, generateTTSController);

module.exports = router;
