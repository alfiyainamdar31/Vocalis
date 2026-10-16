const bcrypt = require("bcryptjs");
const User = require("../models/User.js");

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  twoFactorEnabled: user.twoFactorEnabled,
});

const findByEmail = async (email) =>
  User.findOne({ email: email.trim().toLowerCase() });

const findById = async (id) => User.findById(id);

const verifyPassword = async (user, password) => {
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
};

const setTwoFactorPendingSecret = async (userId, secret) =>
  User.findByIdAndUpdate(
    userId,
    { twoFactorPendingSecret: secret },
    { new: true },
  );

const enableTwoFactor = async (userId, secret) =>
  User.findByIdAndUpdate(
    userId,
    {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorPendingSecret: "",
    },
    { new: true },
  );

const disableTwoFactor = async (userId) =>
  User.findByIdAndUpdate(
    userId,
    {
      twoFactorEnabled: false,
      twoFactorSecret: "",
      twoFactorPendingSecret: "",
    },
    { new: true },
  );

const updateLastActive = async (userId) =>
  User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });

module.exports = {
  toPublicUser,
  findByEmail,
  findById,
  verifyPassword,
  setTwoFactorPendingSecret,
  enableTwoFactor,
  disableTwoFactor,
  updateLastActive,
};
