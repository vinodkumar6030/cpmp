require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getPrisma } = require('./utils/prisma');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const messageRoutes = require('./routes/messages');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Health check — shows DB live status
app.get('/api/health', async (req, res) => {
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', time: new Date() });
  } catch (err) {
    res.status(503).json({ status: 'degraded', db: 'disconnected', error: err.message, time: new Date() });
  }
});

// Global error handler — handles DB disconnections gracefully
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  const isDbErr =
    err.constructor?.name === 'PrismaClientInitializationError' ||
    err.message?.includes('Server has closed the connection') ||
    err.message?.includes('P1001') ||
    err.message?.includes('P1017');
  if (isDbErr) {
    return res.status(503).json({
      message: 'Database is temporarily unavailable. Please try again shortly.',
      detail: err.message
    });
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await getPrisma().$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.warn('⚠️  Tip: Update DATABASE_URL in Render environment variables with a live MySQL host.');
  }
  app.listen(PORT, () => {
    console.log(`\n🚀 Campus Marketplace API → http://localhost:${PORT}`);
    console.log('📧 Email service: Brevo SMTP active');
  });
}

bootstrap();
