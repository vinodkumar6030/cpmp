const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

// GET /api/messages/conversations — all chat threads for current user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all messages involving this user, grouped by product+otherUser
    const messages = await getPrisma().message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true, profilePhoto: true } },
        receiver: { select: { id: true, name: true, profilePhoto: true } },
        product: { select: { id: true, title: true, images: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Build unique conversations: key = productId-otherUserId
    const conversations = {};
    messages.forEach(msg => {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const key = `${msg.productId}-${otherId}`;
      if (!conversations[key]) {
        conversations[key] = {
          productId: msg.productId,
          product: msg.product,
          otherUser: msg.senderId === userId ? msg.receiver : msg.sender,
          lastMessage: msg.text,
          lastTime: msg.createdAt
        };
      }
    });

    res.json(Object.values(conversations));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// GET /api/messages/:productId/:userId — messages in a thread
router.get('/:productId/:userId', authenticate, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const otherUserId = parseInt(req.params.userId);
    const myId = req.user.id;

    const messages = await getPrisma().message.findMany({
      where: {
        productId,
        OR: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, profilePhoto: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// POST /api/messages/:productId/:userId — send a message
router.post('/:productId/:userId', authenticate, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const receiverId = parseInt(req.params.userId);
    const { text } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ message: 'Message cannot be empty' });
    if (req.user.id === receiverId) return res.status(400).json({ message: 'Cannot message yourself' });

    const message = await getPrisma().message.create({
      data: { text: text.trim(), senderId: req.user.id, receiverId, productId },
      include: { sender: { select: { id: true, name: true, profilePhoto: true } } }
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = router;
