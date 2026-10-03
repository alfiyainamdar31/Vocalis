// backend/src/services/emailService.js
const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config/env.js");

const transporter = nodemailer.createTransport({
  service: "gmail", // or use host: "smtp.gmail.com", port: 587, secure: false [citation:11]
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS, // 16-character App Password
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Vocalis" <${EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Vocalis verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Your one-time verification code is:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; text-align: center; padding: 16px; background: #f1f5f9; border-radius: 8px;">${otp}</p>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
