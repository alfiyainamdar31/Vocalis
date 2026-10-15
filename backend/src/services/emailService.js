const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config/env.js");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP transporter verification failed:", error);
  } else {
    console.log("SMTP transporter is ready");
  }
});

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Vocalis" <${EMAIL_USER}>`,
    to,
    subject: "Your Vocalis verification code",
    html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("OTP email sent:", info.messageId);
  return info;
};

module.exports = { sendOtpEmail };
