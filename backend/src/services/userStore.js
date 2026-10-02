const bcrypt = require("bcryptjs");
const User = require("../models/User.js");

const normalizeEmail = (email) => email.trim().toLowerCase();

const findByEmail = async (email) =>
  User.findOne({ email: normalizeEmail(email) });

const findById = async (id) => User.findById(id);

const createUser = async ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error("An account with this email already exists.");
    err.code = "email_in_use";
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  return user;
};

const verifyPassword = async (user, plainPassword) => {
  if (!user) return false;
  return bcrypt.compare(plainPassword, user.passwordHash);
};

const toPublicUser = (user) => {
  if (!user) return null;
  return user.toJSON();
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  verifyPassword,
  toPublicUser,
};
