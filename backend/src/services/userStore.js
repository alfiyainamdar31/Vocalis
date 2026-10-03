// server/src/services/userStore.js

const bcrypt = require("bcryptjs");
const User = require("../models/User.js");

const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};

const findByEmail = async (email) => {
  return User.findOne({
    email: normalizeEmail(email),
  });
};

const findById = async (id) => {
  return User.findById(id);
};

/*
 * IMPORTANT:
 * This function is ONLY called after the user has
 * successfully verified the signup OTP.
 */
const createVerifiedUser = async ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  const existing = await User.findOne({
    email: normalizedEmail,
  });

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
    emailVerified: true,
  });

  return user;
};

const verifyPassword = async (user, plainPassword) => {
  if (!user) {
    return false;
  }

  return bcrypt.compare(plainPassword, user.passwordHash);
};

const toPublicUser = (user) => {
  return user ? user.toJSON() : null;
};

/*
 * 2FA
 */

const setTwoFactorPendingSecret = async (userId, secret) => {
  return User.findByIdAndUpdate(
    userId,
    {
      twoFactorPendingSecret: secret,
    },
    {
      new: true,
    },
  );
};

const enableTwoFactor = async (userId, secret) => {
  return User.findByIdAndUpdate(
    userId,
    {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorPendingSecret: "",
    },
    {
      new: true,
    },
  );
};

const disableTwoFactor = async (userId) => {
  return User.findByIdAndUpdate(
    userId,
    {
      twoFactorEnabled: false,
      twoFactorSecret: "",
      twoFactorPendingSecret: "",
    },
    {
      new: true,
    },
  );
};

module.exports = {
  createVerifiedUser,
  findByEmail,
  findById,
  verifyPassword,
  toPublicUser,

  setTwoFactorPendingSecret,
  enableTwoFactor,
  disableTwoFactor,
};
