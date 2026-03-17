const nodemailer = require('nodemailer');

// Create transporter (Brevo SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send Verification Email
const sendVerificationEmail = async (to, name, token) => {
  try {
    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const info = await transporter.sendMail({
      from: `"Campus Marketplace" <${process.env.SMTP_USER}>`,
      to,
      subject: "Verify your account",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome to Campus Marketplace 🎉</h2>
          <p>Hi <b>${name}</b>,</p>
          <p>Please verify your email:</p>
          <a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">
            Verify Email
          </a>
          <p>If button doesn't work, copy this link:</p>
          <p>${link}</p>
        </div>
      `,
    });

    console.log("✅ Verification email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};

// Send Password Reset Email
const sendPasswordResetEmail = async (to, name, token) => {
  try {
    const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const info = await transporter.sendMail({
      from: `"Campus Marketplace" <${process.env.SMTP_USER}>`,
      to,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Password Reset 🔐</h2>
          <p>Hi <b>${name}</b>,</p>
          <p>Click below to reset password:</p>
          <a href="${link}" style="background:#ef4444;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">
            Reset Password
          </a>
          <p>If button doesn't work, copy this link:</p>
          <p>${link}</p>
        </div>
      `,
    });

    console.log("✅ Reset email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};