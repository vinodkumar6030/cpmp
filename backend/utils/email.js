const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Send verification email
const sendVerificationEmail = async (to, name, token) => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: "Campus Marketplace <onboarding@resend.dev>",
      to: to,
      subject: "Verify your Campus Marketplace account",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#4f46e5">Welcome ${name} 🎉</h2>
          <p>Please verify your email:</p>
          <a href="${link}" 
             style="display:inline-block;background:#4f46e5;color:#fff;
                    padding:12px 24px;border-radius:8px;text-decoration:none;">
            Verify Email
          </a>
          <p style="margin-top:20px;color:#666">${link}</p>
        </div>
      `
    });

    console.log("✅ Verification email sent");
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

// ✅ Send reset email (optional but recommended)
const sendPasswordResetEmail = async (to, name, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: "Campus Marketplace <onboarding@resend.dev>",
      to: to,
      subject: "Reset your password",
      html: `
        <h2>Hello ${name}</h2>
        <p>Click below to reset password:</p>
        <a href="${link}">Reset Password</a>
      `
    });

    console.log("✅ Reset email sent");
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };