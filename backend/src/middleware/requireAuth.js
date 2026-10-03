// server/src/middleware/requireAuth.js

const { getUserFromToken } = require("../services/authService.js");

const requireAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "missing_token",
        message: "Authentication required.",
      });
    }

    const token = authorization.slice(7);

    const user = await getUserFromToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "invalid_token",
        message:
          "Your session is invalid or has expired. Please sign in again.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(401).json({
      success: false,
      code: "authentication_failed",
      message: "Authentication failed. Please sign in again.",
    });
  }
};

module.exports = {
  requireAuth,
};
