const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendNewListingEmail } = require('../utils/email');

// GET /api/products?search=&category=&condition=&minPrice=&maxPrice=&sort=
router.get('/', async (req, res) => {
  try {
    const { search, category, condition, minPrice, maxPrice, sort } = req.query;
    const where = { status: 'active' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category && category !== 'All') where.category = category;
    if (condition && condition !== 'All') where.condition = condition;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const products = await getPrisma().product.findMany({
      where,
      orderBy,
      include: {
        seller: { select: { id: true, name: true, profilePhoto: true, department: true, phone: true } }
      }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
});

// POST /api/products
router.post('/', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, category, condition, location } = req.body;
    if (!title || !price || !category) return res.status(400).json({ message: 'Title, price, category required' });

    const images = req.files ? req.files.map(f => `/uploads/products/${f.filename}`) : [];

    const product = await getPrisma().product.create({
      data: {
        title, description, price: parseFloat(price),
        category, condition: condition || 'Used',
        images: JSON.stringify(images), location,
        sellerId: req.user.id
      },
      include: { seller: { select: { id: true, name: true, profilePhoto: true, email: true } } }
    });

    // 📧 Notify seller by email (non-blocking)
    if (product.seller?.email) {
      sendNewListingEmail(product.seller.email, product.seller.name, product, product.id)
        .catch(err => console.error('Email notification failed:', err.message));
    }

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create listing', error: err.message });
  }
});

// GET /api/products/my — own listings
router.get('/my', authenticate, async (req, res) => {
  try {
    const products = await getPrisma().product.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your listings' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await getPrisma().product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        seller: { select: { id: true, name: true, profilePhoto: true, department: true, year: true, phone: true, email: true } }
      }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// PUT /api/products/:id
router.put('/:id', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const product = await getPrisma().product.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, price, category, condition, location } = req.body;
    let images = JSON.parse(product.images || '[]');
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/products/${f.filename}`);
    }

    const updated = await getPrisma().product.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description, price: parseFloat(price), category, condition, location, images: JSON.stringify(images) }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update listing' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const product = await getPrisma().product.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await getPrisma().product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete listing' });
  }
});

// PATCH /api/products/:id/sold
router.patch('/:id/sold', authenticate, async (req, res) => {
  try {
    const product = await getPrisma().product.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.sellerId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const updated = await getPrisma().product.update({
      where: { id: parseInt(req.params.id) },
      data: { status: product.status === 'sold' ? 'active' : 'sold' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});

module.exports = router;
