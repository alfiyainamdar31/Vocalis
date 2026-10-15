const {
  signup,
  login,
  verifyEmailOtp,
  resendSignupOtp,
  resendLoginOtp,
  verifyLoginOtp,
  verify2FALogin,
  generate2FASetup,
  verify2FASetup,
  disable2FA,
} = require("../services/authService.js");

const handleAuthError = (res, err) => {
  const status = err.status || 500;
  const code = err.code || "internal_error";

  if (status >= 500) {
    console.error("Auth error:", err);
  }

  return res.status(status).json({
    success: false,
    code,
    message:
      status >= 500 ? "Something went wrong. Please try again." : err.message,
  });
};

const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await signup({ name, email, password });
    return res.status(201).json({ success: true, ...result });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

const resendSignupOtpController = async (req, res) => {
  try {
    const { partialToken } = req.body;
    if (!partialToken) {
      return res.status(400).json({
        success: false,
        code: "invalid_input",
        message: "Verification session is required.",
      });
    }
    const result = await resendSignupOtp(partialToken);
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

const verifyEmailOtpController = async (req, res) => {
  try {
    const { partialToken, otp } = req.body;
    if (!partialToken || !otp) {
      return res.status(400).json({
        success: false,
        code: "invalid_input",
        message: "Verification token and OTP are required.",
      });
    }
    const result = await verifyEmailOtp(partialToken, otp);
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        code: "invalid_input",
        message: "Email and password are required.",
      });
    }

    const result = await login({ email, password });
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

const resendLoginOtpController = async (req, res) => {
  try {
    const { partialToken } = req.body;
    if (!partialToken) {
      return res.status(400).json({
        success: false,
        code: "invalid_input",
        message: "Login session is required.",
      });
    }
    const result = await resendLoginOtp(partialToken);
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

const verifyLoginOtpController = async (req, res) => {
  try {
    const { partialToken, otp } = req.body;
    if (!partialToken || !otp) {
      return res.status(400).json({
        success: false,
        code: "invalid_input",
        message: "Login session and OTP are required.",
      });
    }
    const result = await verifyLoginOtp(partialToken, otp);
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

const verify2FALoginController = async (req, res) => {
  try {
    const { partialToken, otp } = req.body;
    if (!partialToken || !otp) {
      return res.status(400).json({
        success: false,
        code: "invalid_input",
        message: "2FA session and authenticator code are required.",
      });
    }
    const result = await verify2FALogin(partialToken, otp);
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

const meController = (req, res) => {
  return res.json({ success: true, user: req.user });
};

const logoutController = (_req, res) => {
  return res.json({ success: true });
};

const generate2FASetupController = async (req, res) => {
  try {
    const result = await generate2FASetup(req.user.id);
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

const verify2FASetupController = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        code: "invalid_input",
        message: "Authenticator code is required.",
      });
    }
    const result = await verify2FASetup(req.user.id, otp);
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

const disable2FAController = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        code: "invalid_input",
        message: "Authenticator code is required.",
      });
    }
    const result = await disable2FA(req.user.id, otp);
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

module.exports = {
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
};
