const bcrypt = require("bcryptjs");
const User = require("../models/User.js");

const toPublicUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
  };
};

const createVerifiedUser = async ({ name, email, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    emailVerified: true,
  });
  return user;
};

const findByEmail = async (email) => {
  return User.findOne({ email: email.trim().toLowerCase() });
};

const findById = async (id) => {
  return User.findById(id);
};

const verifyPassword = async (user, password) => {
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
};

const setTwoFactorPendingSecret = async (userId, secret) => {
  return User.findByIdAndUpdate(
    userId,
    { twoFactorPendingSecret: secret },
    { new: true },
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
    { new: true },
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
    { new: true },
  );
};

const updateLastActive = async (userId) => {
  return User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
};

module.exports = {
  toPublicUser,
  createVerifiedUser,
  findByEmail,
  findById,
  verifyPassword,
  setTwoFactorPendingSecret,
  enableTwoFactor,
  disableTwoFactor,
  updateLastActive,
};
