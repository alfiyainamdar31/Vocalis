const { Resend } = require("resend");
const { RESEND_API_KEY } = require("../config/env.js");

if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY is missing");
}

const resend = new Resend(RESEND_API_KEY);

const withTimeout = (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const sendOtpEmail = async (to, otp) => {
  console.log("Attempting to send OTP email to:", to);

  const sendPromise = resend.emails.send({
    from: "Vocalis <onboarding@resend.dev>",
    to,
    subject: "Your Vocalis verification code",
    html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });

  const result = await withTimeout(sendPromise, 10000, "Resend API");

  if (result.error) {
    console.error("Resend error:", result.error);
    throw new Error(result.error.message || "Resend send failed");
  }

  console.log("OTP email sent:", result.data?.id);
  return result.data;
};

module.exports = { sendOtpEmail };
