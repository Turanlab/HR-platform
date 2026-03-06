require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const cvRoutes = require('./routes/cv');
const candidateRoutes = require('./routes/candidates');
const adminRoutes = require('./routes/admin');
const companyRoutes = require('./routes/companies');
const messageRoutes = require('./routes/messages');
const subscriptionRoutes = require('./routes/subscriptions');
const aiRoutes = require('./routes/ai');
const cvBuilderRoutes = require('./routes/cvBuilder');
const templateRoutes = require('./routes/templates');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_default_secret_change_me';

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Socket.io JWT authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user?.id;
  if (userId) {
    socket.join(`user_${userId}`);
    io.emit('user_online', { user_id: userId });

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on('send_message', (data) => {
      if (data.receiver_id) {
        io.to(`user_${data.receiver_id}`).emit('new_message', data);
      }
    });

    socket.on('disconnect', () => {
      io.emit('user_offline', { user_id: userId });
    });
  }
});

// Make io available to route handlers
app.set('io', io);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Raw body parser for Stripe webhooks (must be before express.json)
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many upload requests from this IP, please try again after 15 minutes.' }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many AI requests from this IP, please try again after 15 minutes.' }
});

// Existing routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/cvs', uploadLimiter, cvRoutes);
app.use('/api/candidates', apiLimiter, candidateRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

// New routes
app.use('/api/companies', apiLimiter, companyRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/subscriptions', apiLimiter, subscriptionRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/cv-builder', apiLimiter, cvBuilderRoutes);
app.use('/api/templates', apiLimiter, templateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`HR Platform server running on port ${PORT}`);
});

module.exports = app;
