const express = require("express");
const router = express.Router();

const {
  signupController,
  resendSignupOtpController,
  verifyEmailOtpController,
  loginController,
  resendLoginOtpController,
  verifyLoginOtpController,
  verify2FALoginController,
  meController,
  logoutController,
  generate2FASetupController,
  verify2FASetupController,
  disable2FAController,
} = require("../controllers/authController.js");

const { requireAuth } = require("../middleware/requireAuth.js");

router.post("/signup", signupController);
router.post("/signup/resend-otp", resendSignupOtpController);
router.post("/signup/verify-otp", verifyEmailOtpController);

router.post("/login", loginController);
router.post("/login/resend-otp", resendLoginOtpController);
router.post("/login/verify-otp", verifyLoginOtpController);
router.post("/login/verify-2fa", verify2FALoginController);

router.get("/me", requireAuth, meController);
router.post("/logout", requireAuth, logoutController);

router.post("/2fa/setup", requireAuth, generate2FASetupController);
router.post("/2fa/verify-setup", requireAuth, verify2FASetupController);
router.post("/2fa/disable", requireAuth, disable2FAController);

module.exports = router;
