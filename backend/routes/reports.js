const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

// POST /api/reports
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, reason } = req.body;
    if (!productId || !reason) return res.status(400).json({ message: 'Product ID and reason required' });

    const report = await getPrisma().report.create({
      data: { productId: parseInt(productId), reason, reportedBy: req.user.id }
    });
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

module.exports = router;
