const { signup, login } = require("../services/authService.js");

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
    return res.status(201).json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    return res.json({
      success: true,
      user: result.user,
      token: result.token,
    });
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

module.exports = {
  signupController,
  loginController,
  meController,
  logoutController,
};
