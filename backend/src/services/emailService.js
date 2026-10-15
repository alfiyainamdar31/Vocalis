const { Resend } = require("resend");
const { RESEND_API_KEY, EMAIL_USER } = require("../config/env.js");

const resend = new Resend(RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
  const { data, error } = await resend.emails.send({
    from: `Vocalis <onboarding@resend.dev>`,
    to,
    subject: "Your Vocalis verification code",
    html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }

  console.log("OTP email sent:", data.id);
  return data;
};

module.exports = { sendOtpEmail };
