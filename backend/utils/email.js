const nodemailer = require('nodemailer');

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    // Production SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else {
    // Development: Ethereal fake SMTP
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log('\n📬 Ethereal SMTP created. Preview emails at https://ethereal.email');
  }
  return transporter;
};

const sendVerificationEmail = async (to, name, token) => {
  const tp = await getTransporter();
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  const info = await tp.sendMail({
    from: `"Campus Marketplace" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Verify your Campus Marketplace account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#4f46e5">Welcome to Campus Marketplace!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Please verify your college email to start buying and selling:</p>
        <a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          Verify Email
        </a>
        <p style="margin-top:20px;color:#666">Or copy this link: ${link}</p>
      </div>
    `
  });
  console.log(`\n📧 Verification email sent to ${to}`);
  if (nodemailer.getTestMessageUrl(info)) {
    console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
};

const sendPasswordResetEmail = async (to, name, token) => {
  const tp = await getTransporter();
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  const info = await tp.sendMail({
    from: `"Campus Marketplace" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Reset your Campus Marketplace password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#4f46e5">Password Reset</h2>
        <p>Hi <strong>${name}</strong>, click below to reset your password (expires in 1 hour):</p>
        <a href="${link}" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          Reset Password
        </a>
        <p style="margin-top:20px;color:#666">Or copy this link: ${link}</p>
      </div>
    `
  });
  console.log(`\n📧 Password reset email sent to ${to}`);
  if (nodemailer.getTestMessageUrl(info)) {
    console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
