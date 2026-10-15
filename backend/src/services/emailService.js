const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config/env.js");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 10000,
});

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Vocalis" <${EMAIL_USER}>`,
    to,
    subject: "Your Vocalis verification code",
    html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  };

  const sendPromise = transporter.sendMail(mailOptions);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Email send timed out")), 12000),
  );

  await Promise.race([sendPromise, timeoutPromise]);
};

module.exports = { sendOtpEmail };
