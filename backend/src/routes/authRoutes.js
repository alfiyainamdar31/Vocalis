const express = require("express");
const {
  signupController,
  loginController,
  meController,
  logoutController,
} = require("../controllers/authController.js");
const { requireAuth } = require("../middleware/requireAuth.js");

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/me", requireAuth, meController);
router.post("/logout", logoutController);

module.exports = router;
