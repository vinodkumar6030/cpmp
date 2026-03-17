const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (to, name, token) => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: "Campus Marketplace <onboarding@resend.dev>",
      to,
      subject: "Verify your account",
      html: `<a href="${link}">Verify Email</a>`
    });

    console.log("✅ Email sent");
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};

module.exports = { sendVerificationEmail };