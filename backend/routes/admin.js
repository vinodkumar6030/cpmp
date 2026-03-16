const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [users, products, reports] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.report.count({ where: { status: 'pending' } })
    ]);
    res.json({ users, products, pendingReports: reports });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, department: true, year: true, role: true, isVerified: true, isSuspended: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/suspend
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot suspend admin' });

    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isSuspended: !user.isSuspended }
    });
    res.json({ message: `User ${updated.isSuspended ? 'suspended' : 'unsuspended'}`, user: { id: updated.id, isSuspended: updated.isSuspended } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { seller: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// GET /api/admin/reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        product: { select: { id: true, title: true } },
        reporter: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// PATCH /api/admin/reports/:id/resolve
router.patch('/reports/:id/resolve', async (req, res) => {
  try {
    const report = await prisma.report.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'resolved' }
    });
    res.json({ message: 'Report resolved', report });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resolve report' });
  }
});

module.exports = router;
