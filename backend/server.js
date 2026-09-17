import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import githubRoutes from './routes/githubRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import skillsRoutes from './routes/skillsRoutes.js';
import { initSocket } from './socket/socketHandler.js';
import { setSocketIO } from './utils/notificationHelper.js';
import { ensureTextIndex } from './services/searchService.js';
import { ensureApplicationIndexes } from './models/Application.js';
import { migrateUsernames } from './scripts/migrateUsernames.js';
import { autoSeedIfEmpty, seedDatabase } from './scripts/seedDatabase.js';

dotenv.config();

// ── Database ───────────────────────────────────────────────────────────────────
connectDB().then(async () => {
  await ensureTextIndex().catch((err) => console.warn('Index setup:', err.message));
  await ensureApplicationIndexes().catch((err) => console.warn('Application index setup:', err.message));
  await migrateUsernames(); // Safe to run every startup
  await autoSeedIfEmpty(); // Auto-seed realistic sample data if DB is empty
});

const app = express();
const server = http.createServer(app);

// ── CORS (Must be at top before rate limiters & body parsers) ─────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://developer-collaboration-hub.vercel.app',
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setSocketIO(io);
initSocket(io);

// ── Security middleware ────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: false, // Disable CSP to avoid breaking React app in dev
  })
);

// Rate limiting — generous thresholds to allow active app usage without 429 errors
const isProd = process.env.NODE_ENV === 'production';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 3000 : 10000, // Generous limit: allows 750+ page transitions per 15 min
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 1000,
  message: { message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);

// ── Body parsing & sanitization ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize()); // Prevent NoSQL injection

// ── Health check & Seed endpoint ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Developer Collaboration Hub API' });
});

app.get('/api/seed', async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({
      success: true,
      message: 'Successfully seeded 12 Indian developer profiles, 10 projects, applications, badges, and chat messages into MongoDB!',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/skills', skillsRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
