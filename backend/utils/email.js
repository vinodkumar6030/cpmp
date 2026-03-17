const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Verification Email
const sendVerificationEmail = async (to, name, token) => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: "Campus Marketplace <onboarding@resend.dev>",
      to,
      subject: "Verify your account",
      html: `
        <h2>Hello ${name}</h2>
        <p>Click below to verify your account:</p>
        <a href="${link}">Verify Email</a>
      `
    });

    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};

module.exports = { sendVerificationEmail };