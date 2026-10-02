const { getUserFromToken } = require("../services/authService.js");

const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      code: "unauthorized",
      message: "Authentication required.",
    });
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        code: "invalid_token",
        message: "Your session has expired. Please sign in again.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({
      success: false,
      code: "internal_error",
      message: "Something went wrong.",
    });
  }
};

const optionalAuth = async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme === "Bearer" && token) {
    try {
      const user = await getUserFromToken(token);
      if (user) req.user = user;
    } catch {
      /* ignore */
    }
  }

  next();
};

module.exports = { requireAuth, optionalAuth };
