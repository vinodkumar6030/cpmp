const axios = require('axios');

// ✅ Send Verification Email
const sendVerificationEmail = async (to, name, token) => {
  try {
    // 🔍 Debug (remove later)
    console.log("API KEY:", process.env.BREVO_API_KEY);

    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is missing in environment variables");
    }

    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Campus Marketplace",
          email: "campusmarketplaceverify@gmail.com", // ✅ must be verified in Brevo
        },
        to: [{ email: to }],
        subject: "Verify your account",
        htmlContent: `
          <div style="font-family: Arial;">
            <h2>Welcome ${name} 🎉</h2>
            <p>Please click below to verify your account:</p>
            <a href="${link}" style="background:#4f46e5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
              Verify Email
            </a>
            <p>Or copy this link:</p>
            <p>${link}</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY.trim(), // ✅ IMPORTANT FIX
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent:", response.data);
  } catch (err) {
    console.error(
      "❌ Email error:",
      err.response?.data || err.message
    );
  }
};

// ✅ Send Password Reset Email
const sendPasswordResetEmail = async (to, name, token) => {
  try {
    const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Campus Marketplace",
          email: "campusmarketplaceverify@gmail.com",
        },
        to: [{ email: to }],
        subject: "Reset your password",
        htmlContent: `
          <div style="font-family: Arial;">
            <h2>Password Reset 🔐</h2>
            <p>Hi ${name},</p>
            <p>Click below to reset your password:</p>
            <a href="${link}">${link}</a>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY.trim(),
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Reset email sent:", response.data);
  } catch (err) {
    console.error(
      "❌ Email error:",
      err.response?.data || err.message
    );
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};