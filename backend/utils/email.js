const axios = require('axios');

const sendVerificationEmail = async (to, name, token) => {
  try {
    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Campus Marketplace",
          email: "campusmarketplaceverify@gmail.com",
        },
        to: [{ email: to }],
        subject: "Verify your account",
        htmlContent: `
          <h2>Welcome ${name}</h2>
          <p>Click below to verify:</p>
          <a href="${link}">${link}</a>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY, // ✅ IMPORTANT
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent:", response.data);
  } catch (err) {
    console.error("❌ Email error:", err.response?.data || err.message);
  }
};

module.exports = { sendVerificationEmail };