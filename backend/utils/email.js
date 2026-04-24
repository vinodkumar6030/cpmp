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

// ✅ Send New Listing Notification to Seller
const sendNewListingEmail = async (to, name, product, productId) => {
  try {
    if (!process.env.BREVO_API_KEY) return;
    const link = `${process.env.CLIENT_URL}/products/${productId}`;
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Campus Marketplace", email: "campusmarketplaceverify@gmail.com" },
        to: [{ email: to }],
        subject: `🎉 Your listing "${product.title}" is now live!`,
        htmlContent: `
          <div style="font-family:Arial;max-width:520px;margin:0 auto;background:#0f0f13;color:#f0f0ff;padding:2rem;border-radius:16px;">
            <h2 style="color:#818cf8;">Your listing is live! 🚀</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Great news! Your item has been listed on <strong>Campus Marketplace</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:1rem 0;">
              <tr><td style="padding:6px 0;color:#a0a0c0;">📦 Item</td><td style="padding:6px 0;font-weight:600;">${product.title}</td></tr>
              <tr><td style="padding:6px 0;color:#a0a0c0;">💰 Price</td><td style="padding:6px 0;color:#10b981;font-weight:700;">₹${Number(product.price).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding:6px 0;color:#a0a0c0;">🏷️ Category</td><td style="padding:6px 0;">${product.category}</td></tr>
              <tr><td style="padding:6px 0;color:#a0a0c0;">📊 Condition</td><td style="padding:6px 0;">${product.condition}</td></tr>
            </table>
            <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;padding:12px 24px;text-decoration:none;border-radius:10px;font-weight:600;">
              View Your Listing →
            </a>
            <p style="margin-top:1.5rem;color:#5a5a80;font-size:0.85rem;">Buyers can now find and contact you. You'll get messages when someone is interested!</p>
          </div>
        `,
      },
      { headers: { "api-key": process.env.BREVO_API_KEY.trim(), "Content-Type": "application/json" } }
    );
    console.log("✅ Listing notification sent to:", to);
  } catch (err) {
    console.error("❌ Listing email error:", err.response?.data || err.message);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNewListingEmail,
};