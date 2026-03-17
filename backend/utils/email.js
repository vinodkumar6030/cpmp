const nodemailer = require('nodemailer');

// ✅ Brevo SMTP transporter (stable for Render)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465, // 🔥 IMPORTANT (fix timeout)
  secure: true, // MUST be true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Verify transporter (optional but helpful)
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP connection error:", error);
  } else {
    console.log("✅ SMTP server is ready");
  }
});

// ✅ Send Verification Email
const sendVerificationEmail = async (to, name, token) => {
  try {
    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const info = await transporter.sendMail({
      from: `"Campus Marketplace" <campusmarketplaceverify@gmail.com>`, // ✅ MUST be verified email
      to,
      subject: "Verify your account",
      html: `
        <div style="font-family: Arial;">
          <h2>Welcome to Campus Marketplace 🎉</h2>
          <p>Hi <b>${name}</b>,</p>
          <p>Please click below to verify your account:</p>
          <a href="${link}" style="background:#4f46e5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
            Verify Email
          </a>
          <p>Or copy link:</p>
          <p>${link}</p>
        </div>
      `,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};

// ✅ Send Password Reset Email
const sendPasswordResetEmail = async (to, name, token) => {
  try {
    const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const info = await transporter.sendMail({
      from: `"Campus Marketplace" <campusmarketplaceverify@gmail.com>`,
      to,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial;">
          <h2>Password Reset 🔐</h2>
          <p>Hi <b>${name}</b>,</p>
          <p>Click below to reset your password:</p>
          <a href="${link}" style="background:#ef4444;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
            Reset Password
          </a>
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