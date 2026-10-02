const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env.js");
const {
  createUser,
  findByEmail,
  findById,
  verifyPassword,
  toPublicUser,
} = require("./userStore.js");

const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const signup = async ({ name, email, password }) => {
  if (!name || !name.trim()) {
    const err = new Error("Name is required.");
    err.code = "invalid_input";
    err.status = 400;
    throw err;
  }
  if (!email || !email.trim()) {
    const err = new Error("Email is required.");
    err.code = "invalid_input";
    err.status = 400;
    throw err;
  }
  if (!password || password.length < 8) {
    const err = new Error("Password must be at least 8 characters.");
    err.code = "invalid_input";
    err.status = 400;
    throw err;
  }

  const user = await createUser({ name, email, password });
  const token = signToken(user);

  return { user: toPublicUser(user), token };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    const err = new Error("Email and password are required.");
    err.code = "invalid_input";
    err.status = 400;
    throw err;
  }

  const user = await findByEmail(email);
  const valid = await verifyPassword(user, password);

  if (!valid) {
    const err = new Error("Invalid email or password.");
    err.code = "invalid_credentials";
    err.status = 401;
    throw err;
  }

  const token = signToken(user);
  return { user: toPublicUser(user), token };
};

const getUserFromToken = async (token) => {
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await findById(payload.sub);
  if (!user) return null;

  return toPublicUser(user);
};

module.exports = { signup, login, signToken, verifyToken, getUserFromToken };
