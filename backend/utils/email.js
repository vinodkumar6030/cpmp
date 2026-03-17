const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (to, name, token) => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject: "Verify your account",
      html: `<a href="${link}">Verify Email</a>`
    });

    console.log("EMAIL RESPONSE:", response);
  } catch (err) {
    console.error("EMAIL ERROR FULL:", err);
  }
};

module.exports = { sendVerificationEmail };