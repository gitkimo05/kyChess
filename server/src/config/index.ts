import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'kychess-dev-secret-change-in-production-2024',
  jwtExpiresIn: '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  dbPath: process.env.DB_PATH || path.join(__dirname, '../../data/kychess.db'),
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
  matchmaking: {
    ratingRange: 200,
    maxWaitTime: 30000,
    expandInterval: 5000,
    expandAmount: 100,
  },
};