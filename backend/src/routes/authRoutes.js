// server/src/routes/authRoutes.js

const express = require("express");

const {
  signupController,
  loginController,
  verifyEmailOtpController,
  verify2FALoginController,

  meController,
  logoutController,

  generate2FASetupController,
  verify2FASetupController,
  disable2FAController,
} = require("../controllers/authController.js");

const { requireAuth } = require("../middleware/requireAuth.js");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public authentication routes
|--------------------------------------------------------------------------
*/

router.post("/signup", signupController);

router.post("/login", loginController);

router.post("/verify-email-otp", verifyEmailOtpController);

router.post("/verify-2fa-login", verify2FALoginController);

/*
|--------------------------------------------------------------------------
| Authenticated routes
|--------------------------------------------------------------------------
*/

router.get("/me", requireAuth, meController);

router.post("/logout", requireAuth, logoutController);

/*
|--------------------------------------------------------------------------
| 2FA settings
|--------------------------------------------------------------------------
*/

router.post("/2fa/setup", requireAuth, generate2FASetupController);

router.post("/2fa/verify-setup", requireAuth, verify2FASetupController);

router.post("/2fa/disable", requireAuth, disable2FAController);

module.exports = router;
