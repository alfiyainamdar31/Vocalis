// server/src/services/authService.js

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env.js");

const {
  createVerifiedUser,
  findByEmail,
  findById,
  verifyPassword,
  toPublicUser,
  setTwoFactorPendingSecret,
  enableTwoFactor,
  disableTwoFactor,
} = require("./userStore.js");

const { sendOtpEmail } = require("./emailService.js");

/*
|--------------------------------------------------------------------------
| Temporary signup OTP store
|--------------------------------------------------------------------------
|
| IMPORTANT:
| No MongoDB User document is created here.
|
| Data stays temporary until the correct OTP is entered.
|
| Production note:
| For multiple backend instances, move this to Redis.
|
*/

const signupOtpStore = new Map();

/*
|--------------------------------------------------------------------------
| Token helpers
|--------------------------------------------------------------------------
*/

const signToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      purpose: "access",
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  );
};

const signPartialToken = (user, purpose) => {
  return jwt.sign(
    {
      sub: user.id,
      purpose,
    },
    JWT_SECRET,
    {
      expiresIn: "10m",
    },
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

/*
|--------------------------------------------------------------------------
| Validation helpers
|--------------------------------------------------------------------------
*/

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => {
  return (
    typeof email === "string" && EMAIL_REGEX.test(email.trim().toLowerCase())
  );
};

const validatePassword = (password) => {
  return typeof password === "string" && password.length >= 8;
};

const validateName = (name) => {
  return (
    typeof name === "string" &&
    name.trim().length >= 2 &&
    name.trim().length <= 80
  );
};

const validateOtp = (otp) => {
  return typeof otp === "string" && /^\d{6}$/.test(otp);
};

/*
|--------------------------------------------------------------------------
| OTP
|--------------------------------------------------------------------------
*/

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/*
|--------------------------------------------------------------------------
| SIGNUP
|--------------------------------------------------------------------------
*/

const signup = async ({ name, email, password }) => {
  /*
   * Validate name
   */

  if (!validateName(name)) {
    const err = new Error(
      "Please enter a valid name between 2 and 80 characters.",
    );

    err.code = "invalid_name";
    err.status = 400;

    throw err;
  }

  /*
   * Validate email BEFORE doing anything else
   */

  if (!isValidEmail(email)) {
    const err = new Error("Please enter a valid email address.");

    err.code = "invalid_email";
    err.status = 400;

    throw err;
  }

  /*
   * Validate password
   */

  if (!validatePassword(password)) {
    const err = new Error("Password must be at least 8 characters long.");

    err.code = "invalid_password";
    err.status = 400;

    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();

  /*
   * Check whether a VERIFIED account already exists.
   */

  const existingUser = await findByEmail(normalizedEmail);

  if (existingUser) {
    const err = new Error(
      "An account with this email already exists. Please sign in instead.",
    );

    err.code = "email_in_use";
    err.status = 409;

    throw err;
  }

  /*
   * Generate OTP
   */

  const otp = generateOtp();

  /*
   * Store temporary signup information.
   *
   * IMPORTANT:
   * This is NOT stored in MongoDB.
   *
   * The password is hashed before being placed into
   * temporary memory.
   */

  const bcrypt = require("bcryptjs");

  const passwordHash = await bcrypt.hash(password, 10);

  signupOtpStore.set(normalizedEmail, {
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  /*
   * Send OTP
   */

  try {
    await sendOtpEmail(normalizedEmail, otp);
  } catch (error) {
    /*
     * If email sending fails, remove the temporary
     * signup record so the user can try again.
     */

    signupOtpStore.delete(normalizedEmail);

    const err = new Error(
      "We could not send the verification email. Please try again.",
    );

    err.code = "email_send_failed";
    err.status = 503;

    throw err;
  }

  /*
   * Create a short-lived token that identifies this
   * pending signup.
   *
   * It is NOT an access token.
   */

  const partialToken = jwt.sign(
    {
      email: normalizedEmail,
      purpose: "signup_email_verification",
    },
    JWT_SECRET,
    {
      expiresIn: "10m",
    },
  );

  return {
    requiresEmailVerification: true,
    partialToken,
    message: "Verification code sent to your email.",
  };
};

/*
|--------------------------------------------------------------------------
| VERIFY SIGNUP OTP
|--------------------------------------------------------------------------
*/

const verifyEmailOtp = async (partialToken, otp) => {
  /*
   * Validate OTP format first
   */

  if (!validateOtp(otp)) {
    const err = new Error("Please enter the 6-digit verification code.");

    err.code = "invalid_otp";
    err.status = 400;

    throw err;
  }

  /*
   * Validate temporary signup token
   */

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

  /*
   * Get temporary signup information.
   */

  const signupRecord = signupOtpStore.get(normalizedEmail);

  if (!signupRecord) {
    const err = new Error("No pending signup was found. Please sign up again.");

    err.code = "signup_not_found";
    err.status = 400;

    throw err;
  }

  /*
   * Check expiration
   */

  if (signupRecord.expiresAt < Date.now()) {
    signupOtpStore.delete(normalizedEmail);

    const err = new Error(
      "This verification code has expired. Please sign up again.",
    );

    err.code = "otp_expired";
    err.status = 400;

    throw err;
  }

  /*
   * Check OTP
   */

  if (signupRecord.otp !== otp) {
    const err = new Error(
      "Incorrect verification code. Please check your email and try again.",
    );

    err.code = "invalid_otp";
    err.status = 401;

    throw err;
  }

  /*
   |--------------------------------------------------------------------------
   | OTP IS CORRECT
   |--------------------------------------------------------------------------
   |
   | ONLY NOW do we create the MongoDB user.
   |
   */

  let user;

  try {
    /*
     * We already have a hashed password.
     *
     * createVerifiedUser() normally hashes a plain password,
     * so create the User directly here with the already-hashed
     * password through a dedicated helper.
     */

    const User = require("../models/User.js");

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      signupOtpStore.delete(normalizedEmail);

      const err = new Error(
        "An account with this email already exists. Please sign in instead.",
      );

      err.code = "email_in_use";
      err.status = 409;

      throw err;
    }

    user = await User.create({
      name: signupRecord.name,
      email: signupRecord.email,
      passwordHash: signupRecord.passwordHash,
      emailVerified: true,
    });
  } catch (error) {
    /*
     * If this is one of our intentional errors,
     * pass it through.
     */

    if (error.code === "email_in_use") {
      throw error;
    }

    console.error("User creation error:", error);

    const err = new Error(
      "We could not create your account. Please try again.",
    );

    err.code = "account_creation_failed";
    err.status = 500;

    throw err;
  }

  /*
   * Remove temporary signup data ONLY after
   * successful account creation.
   */

  signupOtpStore.delete(normalizedEmail);

  /*
   * Issue normal authenticated JWT.
   */

  const token = signToken(user);

  return {
    user: toPublicUser(user),
    token,
  };
};

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

const login = async ({ email, password }) => {
  /*
   * Validate email
   */

  if (!isValidEmail(email)) {
    const err = new Error("Please enter a valid email address.");

    err.code = "invalid_email";
    err.status = 400;

    throw err;
  }

  if (typeof password !== "string" || password.length === 0) {
    const err = new Error("Please enter your password.");

    err.code = "invalid_password";
    err.status = 400;

    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await findByEmail(normalizedEmail);

  const valid = await verifyPassword(user, password);

  if (!valid) {
    const err = new Error("Invalid email or password.");

    err.code = "invalid_credentials";
    err.status = 401;

    throw err;
  }

  /*
   * Normally every User in MongoDB is already verified
   * because signup now requires OTP first.
   *
   * Keep this check for safety.
   */

  if (!user.emailVerified) {
    const err = new Error(
      "Please verify your email address before signing in.",
    );

    err.code = "email_not_verified";
    err.status = 403;

    throw err;
  }

  /*
   * 2FA
   */

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    const partialToken = signPartialToken(user, "two_factor_login");

    return {
      requiresTwoFactor: true,
      partialToken,
    };
  }

  /*
   * Normal login
   */

  const token = signToken(user);

  return {
    user: toPublicUser(user),
    token,
  };
};

/*
|--------------------------------------------------------------------------
| VERIFY 2FA DURING LOGIN
|--------------------------------------------------------------------------
*/

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

  const token = signToken(user);

  return {
    user: toPublicUser(user),
    token,
  };
};

/*
|--------------------------------------------------------------------------
| GENERATE 2FA SETUP
|--------------------------------------------------------------------------
*/

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

  /*
   * Generate new secret
   */

  const secret = speakeasy.generateSecret({
    name: `Vocalis:${user.email}`,
    issuer: "Vocalis",
    length: 20,
  });

  /*
   * Store ONLY as pending.
   *
   * It does not become active until the user proves
   * that they successfully configured their authenticator.
   */

  await setTwoFactorPendingSecret(user.id, secret.base32);

  /*
   * Generate QR code
   */

  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
    qrCodeDataUrl,
  };
};

/*
|--------------------------------------------------------------------------
| VERIFY 2FA SETUP
|--------------------------------------------------------------------------
*/

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

  /*
   * OTP is correct.
   *
   * Pending secret becomes the permanent secret.
   */

  const updatedUser = await enableTwoFactor(
    user.id,
    user.twoFactorPendingSecret,
  );

  return {
    user: toPublicUser(updatedUser),
  };
};

/*
|--------------------------------------------------------------------------
| DISABLE 2FA
|--------------------------------------------------------------------------
*/

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

  return {
    user: toPublicUser(updatedUser),
  };
};

/*
|--------------------------------------------------------------------------
| AUTH TOKEN
|--------------------------------------------------------------------------
*/

const getUserFromToken = async (token) => {
  const payload = verifyToken(token);

  if (!payload || payload.purpose !== "access") {
    return null;
  }

  const user = await findById(payload.sub);

  if (!user) {
    return null;
  }

  return toPublicUser(user);
};

module.exports = {
  signup,
  login,
  verifyEmailOtp,

  verify2FALogin,
  generate2FASetup,
  verify2FASetup,
  disable2FA,

  signToken,
  verifyToken,
  getUserFromToken,
};
