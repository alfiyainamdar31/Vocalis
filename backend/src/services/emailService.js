const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config/env.js");

console.log("EMAIL_USER present:", Boolean(EMAIL_USER));
console.log("EMAIL_PASS present:", Boolean(EMAIL_PASS));

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
    console.error("SMTP transporter verification failed:", error.message);
    console.error(error);
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

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("sendMail error name:", error.name);
    console.error("sendMail error code:", error.code);
    console.error("sendMail error response:", error.response);
    console.error("sendMail error message:", error.message);
    throw error;
  }
};

module.exports = { sendOtpEmail };
