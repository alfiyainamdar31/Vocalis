// server/src/controllers/authController.js

const {
  signup,
  login,
  verifyEmailOtp,

  generate2FASetup,
  verify2FASetup,
  verify2FALogin,
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

/*
|--------------------------------------------------------------------------
| SIGNUP
|--------------------------------------------------------------------------
*/

const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const result = await signup({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await login({
      email,
      password,
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

/*
|--------------------------------------------------------------------------
| VERIFY SIGNUP EMAIL OTP
|--------------------------------------------------------------------------
*/

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

    return res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

/*
|--------------------------------------------------------------------------
| 2FA LOGIN
|--------------------------------------------------------------------------
*/

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

    return res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

const meController = (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

const logoutController = (_req, res) => {
  return res.json({
    success: true,
  });
};

/*
|--------------------------------------------------------------------------
| GENERATE 2FA SETUP
|--------------------------------------------------------------------------
*/

const generate2FASetupController = async (req, res) => {
  try {
    const result = await generate2FASetup(req.user.id);

    return res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

/*
|--------------------------------------------------------------------------
| VERIFY 2FA SETUP
|--------------------------------------------------------------------------
*/

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

    return res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

/*
|--------------------------------------------------------------------------
| DISABLE 2FA
|--------------------------------------------------------------------------
*/

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

    return res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

module.exports = {
  signupController,
  loginController,
  verifyEmailOtpController,

  verify2FALoginController,

  meController,
  logoutController,

  generate2FASetupController,
  verify2FASetupController,
  disable2FAController,
};
