const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

const prisma = new PrismaClient();

// GET /api/users/me
router.get('/me', authenticate, async (req, res) => {
  const { password, verifyToken, resetToken, resetTokenExp, ...safe } = req.user;
  res.json(safe);
});

// PUT /api/users/me
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, department, year, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, department, year, phone }
    });
    const { password, verifyToken, resetToken, resetTokenExp, ...safe } = updated;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// POST /api/users/me/photo
router.post('/me/photo', authenticate, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const profilePhoto = `/uploads/profiles/${req.file.filename}`;
    await prisma.user.update({ where: { id: req.user.id }, data: { profilePhoto } });
    res.json({ profilePhoto });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload photo' });
  }
});

// GET /api/users/:id/products — public: view a user's listings
router.get('/:id/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: parseInt(req.params.id), status: 'active' },
      include: { seller: { select: { id: true, name: true, profilePhoto: true, department: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user products' });
  }
});

module.exports = router;
