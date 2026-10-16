const SibApiV3Sdk = require("sib-api-v3-sdk");
const { BREVO_API_KEY, EMAIL_USER } = require("../config/env.js");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = BREVO_API_KEY;

const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendOtpEmail = async (to, otp) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: "Vocalis",
    email: EMAIL_USER,
  };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = "Your Vocalis verification code";
  sendSmtpEmail.htmlContent = `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`;

  try {
    const result = await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
    console.log("OTP email sent to:", to, "messageId:", result.messageId);
    return result;
  } catch (error) {
    console.error("Brevo send error:", {
      message: error?.message,
      code: error?.code,
      response: error?.response?.body,
      status: error?.response?.statusCode,
    });
    throw error;
  }
};

module.exports = { sendOtpEmail };
