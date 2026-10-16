const { Resend } = require("resend");
const { RESEND_API_KEY, RESEND_FROM } = require("../config/env.js");

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
  const sendPromise = resend.emails.send({
    from: RESEND_FROM,
    to,
    subject: "Your Vocalis verification code",
    html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });

  const result = await withTimeout(sendPromise, 10000, "Resend API");

  if (result.error) {
    console.error("Resend error:", result.error);
    throw new Error(result.error.message || "Resend send failed");
  }

  console.log("OTP email sent to:", to, "id:", result.data?.id);
  return result.data;
};

module.exports = { sendOtpEmail };
