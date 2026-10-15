const login = async ({ email, password }) => {
  console.log("login() start for:", email);

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail })
    .maxTimeMS(5000)
    .lean(false);

  console.log("login() user lookup done:", Boolean(user));

  if (!user) {
    const err = new Error("Invalid credentials");
    err.code = "invalid_credentials";
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  console.log("login() password check done:", isMatch);

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
    expiresAt: Date.now() + 10 * 60 * 1000,
    createdAt: Date.now(),
  });

  console.log("login() calling sendOtpEmail");

  try {
    await sendOtpEmail(normalizedEmail, otp);
    console.log("login() sendOtpEmail succeeded");
  } catch (error) {
    loginOtpStore.delete(normalizedEmail);
    console.error("login() sendOtpEmail failed:", error);
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

  console.log("login() returning requiresEmailVerification");

  return {
    requiresEmailVerification: true,
    partialToken,
    message: "Verification code sent to your email.",
  };
};
