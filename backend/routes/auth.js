const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const prisma = new PrismaClient();

const isCollegeEmail = (email) => {
  // Original check removed to allow all emails
  return true;
};

// POST /api/auth/register
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, year, phone } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing)
      return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department,
        year,
        phone,
        verifyToken
      }
    });

    // Send response immediately
    res.status(201).json({
      message: 'Registration successful! Verification email is being sent.'
    });

    // Send email in background (does not block request)
    sendVerificationEmail(email, name, verifyToken)
      .then(() => console.log("Verification email sent"))
      .catch(err => console.error("Email error:", err));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// GET /api/auth/verify-email?token=
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token missing' });

    const user = await prisma.user.findFirst({ where: { verifyToken: token } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null }
    });

    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });
    if (user.isSuspended) return res.status(403).json({ message: 'Account suspended. Contact admin.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    const { password: _, verifyToken, resetToken, resetTokenExp, ...userSafe } = user;
    res.json({ token, user: userSafe });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ message: 'If that email is registered, you will receive a reset link.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExp } });

    await sendPasswordResetEmail(email, user.name, resetToken);
    res.json({ message: 'If that email is registered, you will receive a reset link.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gt: new Date() } }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExp: null }
    });

    res.json({ message: 'Password reset successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed' });
  }
});

module.exports = router;
