const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (to, name, token) => {
  try {
    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"Campus Marketplace" <campusmarketplaceverify@gmail.com>`,
      to,
      subject: "Verify your account",
      html: `
        <h2>Welcome ${name}</h2>
        <p>Click below to verify:</p>
        <a href="${link}">${link}</a>
      `,
    });

    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};

module.exports = { sendVerificationEmail };