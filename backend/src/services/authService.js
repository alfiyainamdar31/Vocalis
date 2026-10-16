const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env.js");

const {
  findById,
  toPublicUser,
  setTwoFactorPendingSecret,
  enableTwoFactor,
  disableTwoFactor,
  updateLastActive,
} = require("./userStore.js");

const { sendOtpEmail } = require("./emailService.js");
const User = require("../models/User.js");

const pendingSignups = new Map();
const loginOtpStore = new Map();

const SESSION_INACTIVITY_MS = 7 * 24 * 60 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) =>
  typeof email === "string" && EMAIL_REGEX.test(email.trim().toLowerCase());

const validatePassword = (password) =>
  typeof password === "string" && password.length >= 8;

const validateName = (name) =>
  typeof name === "string" &&
  name.trim().length >= 2 &&
  name.trim().length <= 80;

const validateOtp = (otp) => typeof otp === "string" && /^\d{6}$/.test(otp);

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email, purpose: "access" }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const signPartialToken = (payload, purpose) =>
  jwt.sign({ ...payload, purpose }, JWT_SECRET, { expiresIn: "10m" });

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const signup = async ({ name, email, password }) => {
  if (!validateName(name)) {
    const err = new Error(
      "Please enter a valid name between 2 and 80 characters.",
    );
    err.code = "invalid_name";
    err.status = 400;
    throw err;
  }

  if (!isValidEmail(email)) {
    const err = new Error("Please enter a valid email address.");
    err.code = "invalid_email";
    err.status = 400;
    throw err;
  }

  if (!validatePassword(password)) {
    const err = new Error("Password must be at least 8 characters long.");
    err.code = "invalid_password";
    err.status = 400;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const err = new Error(
      "An account with this email already exists. Please sign in instead.",
    );
    err.code = "email_in_use";
    err.status = 409;
    throw err;
  }

  const otp = generateOtp();
  const passwordHash = await bcrypt.hash(password, 10);

  pendingSignups.set(normalizedEmail, {
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    createdAt: Date.now(),
  });

  try {
    await sendOtpEmail(normalizedEmail, otp);
  } catch (error) {
    pendingSignups.delete(normalizedEmail);
    console.error("signup sendOtpEmail failed:", error.message);
    const err = new Error(
      "We could not send the verification email. Please try again.",
    );
    err.code = "email_send_failed";
    err.status = 503;
    throw err;
  }

  const partialToken = signPartialToken(
    { email: normalizedEmail },
    "signup_email_verification",
  );

  return {
    requiresEmailVerification: true,
    partialToken,
    message: "Verification code sent to your email.",
  };
};

const resendSignupOtp = async (partialToken) => {
  const payload = verifyToken(partialToken);

  if (
    !payload ||
    payload.purpose !== "signup_email_verification" ||
    !payload.email
  ) {
    const err = new Error(
      "Your verification session has expired. Please sign up again.",
    );
    err.code = "invalid_session";
    err.status = 401;
    throw err;
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const signupRecord = pendingSignups.get(normalizedEmail);

  if (!signupRecord) {
    const err = new Error("No pending signup was found. Please sign up again.");
    err.code = "signup_not_found";
    err.status = 400;
    throw err;
  }

  const timeSinceCreation = Date.now() - signupRecord.createdAt;
  if (timeSinceCreation < 60 * 1000) {
    const waitSeconds = Math.ceil((60 * 1000 - timeSinceCreation) / 1000);
    const err = new Error(
      `Please wait ${waitSeconds} seconds before requesting a new code.`,
    );
    err.code = "rate_limited";
    err.status = 429;
    throw err;
  }

  const newOtp = generateOtp();
  signupRecord.otp = newOtp;
  signupRecord.expiresAt = Date.now() + OTP_TTL_MS;
  signupRecord.createdAt = Date.now();

  try {
    await sendOtpEmail(normalizedEmail, newOtp);
  } catch (error) {
    console.error("resendSignupOtp sendOtpEmail failed:", error.message);
    const err = new Error(
      "We could not send the verification email. Please try again.",
    );
    err.code = "email_send_failed";
    err.status = 503;
    throw err;
  }

  return { message: "New verification code sent." };
};

const verifyEmailOtp = async (partialToken, otp) => {
  if (!validateOtp(otp)) {
    const err = new Error("Please enter the 6-digit verification code.");
    err.code = "invalid_otp";
    err.status = 400;
    throw err;
  }

  const payload = verifyToken(partialToken);

  if (
    !payload ||
    payload.purpose !== "signup_email_verification" ||
    !payload.email
  ) {
    const err = new Error(
      "Your verification session has expired. Please sign up again.",
    );
    err.code = "invalid_session";
    err.status = 401;
    throw err;
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const signupRecord = pendingSignups.get(normalizedEmail);

  if (!signupRecord) {
    const err = new Error("No pending signup was found. Please sign up again.");
    err.code = "signup_not_found";
    err.status = 400;
    throw err;
  }

  if (signupRecord.expiresAt < Date.now()) {
    pendingSignups.delete(normalizedEmail);
    const err = new Error(
      "This verification code has expired. Please sign up again.",
    );
    err.code = "otp_expired";
    err.status = 400;
    throw err;
  }

  if (signupRecord.otp !== otp) {
    const err = new Error(
      "Incorrect verification code. Please check your email and try again.",
    );
    err.code = "invalid_otp";
    err.status = 401;
    throw err;
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    pendingSignups.delete(normalizedEmail);
    const err = new Error(
      "An account with this email already exists. Please sign in instead.",
    );
    err.code = "email_in_use";
    err.status = 409;
    throw err;
  }

  let user;
  try {
    user = await User.create({
      name: signupRecord.name,
      email: signupRecord.email,
      passwordHash: signupRecord.passwordHash,
      emailVerified: true,
      lastActiveAt: new Date(),
    });
  } catch (error) {
    console.error("User creation error:", error);
    const err = new Error(
      "We could not create your account. Please try again.",
    );
    err.code = "account_creation_failed";
    err.status = 500;
    throw err;
  }

  pendingSignups.delete(normalizedEmail);

  const token = signToken(user);

  return {
    user: toPublicUser(user),
    token,
    message: "Account created successfully. You are now logged in.",
  };
};

const login = async ({ email, password }) => {
  if (!isValidEmail(email)) {
    const err = new Error("Please enter a valid email address.");
    err.code = "invalid_email";
    err.status = 400;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).maxTimeMS(8000);

  if (!user) {
    const err = new Error("Invalid credentials");
    err.code = "invalid_credentials";
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.code = "invalid_credentials";
    err.status = 401;
    throw err;
  }

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    const partialToken = signPartialToken({ sub: user.id }, "two_factor_login");
    return { requiresTwoFactor: true, partialToken };
  }

  const otp = generateOtp();

  loginOtpStore.set(normalizedEmail, {
    otp,
    userId: user.id,
    expiresAt: Date.now() + OTP_TTL_MS,
    createdAt: Date.now(),
  });

  try {
    await sendOtpEmail(normalizedEmail, otp);
  } catch (error) {
    loginOtpStore.delete(normalizedEmail);
    console.error("login sendOtpEmail failed:", error.message);
    const err = new Error(
      "We could not send the verification email. Please try again.",
    );
    err.code = "email_send_failed";
    err.status = 503;
    throw err;
  }

  const partialToken = signPartialToken(
    { email: normalizedEmail },
    "login_email_verification",
  );

  return {
    requiresEmailVerification: true,
    partialToken,
    message: "Verification code sent to your email.",
  };
};

const resendLoginOtp = async (partialToken) => {
  const payload = verifyToken(partialToken);

  if (
    !payload ||
    payload.purpose !== "login_email_verification" ||
    !payload.email
  ) {
    const err = new Error(
      "Your login session has expired. Please sign in again.",
    );
    err.code = "invalid_session";
    err.status = 401;
    throw err;
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const record = loginOtpStore.get(normalizedEmail);

  if (!record) {
    const err = new Error("No pending login was found. Please sign in again.");
    err.code = "login_not_found";
    err.status = 400;
    throw err;
  }

  const timeSinceCreation = Date.now() - record.createdAt;
  if (timeSinceCreation < 60 * 1000) {
    const waitSeconds = Math.ceil((60 * 1000 - timeSinceCreation) / 1000);
    const err = new Error(
      `Please wait ${waitSeconds} seconds before requesting a new code.`,
    );
    err.code = "rate_limited";
    err.status = 429;
    throw err;
  }

  const newOtp = generateOtp();
  record.otp = newOtp;
  record.expiresAt = Date.now() + OTP_TTL_MS;
  record.createdAt = Date.now();

  try {
    await sendOtpEmail(normalizedEmail, newOtp);
  } catch (error) {
    console.error("resendLoginOtp sendOtpEmail failed:", error.message);
    const err = new Error(
      "We could not send the verification email. Please try again.",
    );
    err.code = "email_send_failed";
    err.status = 503;
    throw err;
  }

  return { message: "New verification code sent." };
};

const verifyLoginOtp = async (partialToken, otp) => {
  if (!validateOtp(otp)) {
    const err = new Error("Please enter the 6-digit verification code.");
    err.code = "invalid_otp";
    err.status = 400;
    throw err;
  }

  const payload = verifyToken(partialToken);

  if (
    !payload ||
    payload.purpose !== "login_email_verification" ||
    !payload.email
  ) {
    const err = new Error(
      "Your login session has expired. Please sign in again.",
    );
    err.code = "invalid_session";
    err.status = 401;
    throw err;
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const record = loginOtpStore.get(normalizedEmail);

  if (!record) {
    const err = new Error("No pending login was found. Please sign in again.");
    err.code = "login_not_found";
    err.status = 400;
    throw err;
  }

  if (record.expiresAt < Date.now()) {
    loginOtpStore.delete(normalizedEmail);
    const err = new Error(
      "This verification code has expired. Please sign in again.",
    );
    err.code = "otp_expired";
    err.status = 400;
    throw err;
  }

  if (record.otp !== otp) {
    const err = new Error(
      "Incorrect verification code. Please check your email and try again.",
    );
    err.code = "invalid_otp";
    err.status = 401;
    throw err;
  }

  loginOtpStore.delete(normalizedEmail);

  const user = await findById(record.userId);
  if (!user) {
    const err = new Error("User account not found.");
    err.code = "user_not_found";
    err.status = 404;
    throw err;
  }

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    const twoFactorToken = signPartialToken(
      { sub: user.id },
      "two_factor_login",
    );
    return { requiresTwoFactor: true, partialToken: twoFactorToken };
  }

  await updateLastActive(user.id);

  const token = signToken(user);

  return {
    user: toPublicUser(user),
    token,
    message: "Login successful.",
  };
};

const verify2FALogin = async (partialToken, otp) => {
  if (!validateOtp(otp)) {
    const err = new Error("Please enter the 6-digit authenticator code.");
    err.code = "invalid_2fa_code";
    err.status = 400;
    throw err;
  }

  const payload = verifyToken(partialToken);

  if (!payload || payload.purpose !== "two_factor_login") {
    const err = new Error(
      "Your 2FA session has expired. Please sign in again.",
    );
    err.code = "invalid_2fa_session";
    err.status = 401;
    throw err;
  }

  const user = await findById(payload.sub);

  if (!user) {
    const err = new Error("User account not found.");
    err.code = "user_not_found";
    err.status = 404;
    throw err;
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    const err = new Error(
      "Two-factor authentication is not enabled for this account.",
    );
    err.code = "2fa_not_enabled";
    err.status = 400;
    throw err;
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: otp,
    window: 1,
  });

  if (!verified) {
    const err = new Error("Incorrect authenticator code. Please try again.");
    err.code = "invalid_2fa_code";
    err.status = 401;
    throw err;
  }

  await updateLastActive(user.id);

  const token = signToken(user);

  return {
    user: toPublicUser(user),
    token,
  };
};

const generate2FASetup = async (userId) => {
  const user = await findById(userId);

  if (!user) {
    const err = new Error("User account not found.");
    err.code = "user_not_found";
    err.status = 404;
    throw err;
  }

  if (user.twoFactorEnabled) {
    const err = new Error("Two-factor authentication is already enabled.");
    err.code = "2fa_already_enabled";
    err.status = 409;
    throw err;
  }

  const secret = speakeasy.generateSecret({
    name: `Vocalis:${user.email}`,
    issuer: "Vocalis",
    length: 20,
  });

  await setTwoFactorPendingSecret(user.id, secret.base32);

  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
    qrCodeDataUrl,
  };
};

const verify2FASetup = async (userId, otp) => {
  if (!validateOtp(otp)) {
    const err = new Error("Please enter the 6-digit authenticator code.");
    err.code = "invalid_2fa_code";
    err.status = 400;
    throw err;
  }

  const user = await findById(userId);

  if (!user) {
    const err = new Error("User account not found.");
    err.code = "user_not_found";
    err.status = 404;
    throw err;
  }

  if (user.twoFactorEnabled) {
    const err = new Error("Two-factor authentication is already enabled.");
    err.code = "2fa_already_enabled";
    err.status = 409;
    throw err;
  }

  if (!user.twoFactorPendingSecret) {
    const err = new Error(
      "No 2FA setup is currently in progress. Please start setup again.",
    );
    err.code = "2fa_setup_not_found";
    err.status = 400;
    throw err;
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorPendingSecret,
    encoding: "base32",
    token: otp,
    window: 1,
  });

  if (!verified) {
    const err = new Error("Incorrect authenticator code. Please try again.");
    err.code = "invalid_2fa_code";
    err.status = 401;
    throw err;
  }

  const updatedUser = await enableTwoFactor(
    user.id,
    user.twoFactorPendingSecret,
  );

  return { user: toPublicUser(updatedUser) };
};

const disable2FA = async (userId, otp) => {
  if (!validateOtp(otp)) {
    const err = new Error("Please enter the 6-digit authenticator code.");
    err.code = "invalid_2fa_code";
    err.status = 400;
    throw err;
  }

  const user = await findById(userId);

  if (!user) {
    const err = new Error("User account not found.");
    err.code = "user_not_found";
    err.status = 404;
    throw err;
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    const err = new Error("Two-factor authentication is not enabled.");
    err.code = "2fa_not_enabled";
    err.status = 400;
    throw err;
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: otp,
    window: 1,
  });

  if (!verified) {
    const err = new Error(
      "Incorrect authenticator code. 2FA was not disabled.",
    );
    err.code = "invalid_2fa_code";
    err.status = 401;
    throw err;
  }

  const updatedUser = await disableTwoFactor(user.id);

  return { user: toPublicUser(updatedUser) };
};

const getUserFromToken = async (token) => {
  const payload = verifyToken(token);

  if (!payload || payload.purpose !== "access") return null;

  const user = await findById(payload.sub);
  if (!user) return null;

  const lastActive = new Date(user.lastActiveAt).getTime();
  if (Date.now() - lastActive > SESSION_INACTIVITY_MS) {
    return null;
  }

  await updateLastActive(user.id);

  return toPublicUser(user);
};

module.exports = {
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
  signToken,
  verifyToken,
  getUserFromToken,
};
