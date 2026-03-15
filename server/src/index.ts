import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';

import { config } from './config';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import puzzleRoutes from './routes/puzzle';
import userRoutes from './routes/user';
import { setupGameSocket } from './socket/GameSocket';
import { PuzzleModel } from './models/Puzzle';
import { rateLimit } from './middleware/rateLimit';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: config.corsOrigin, methods: ['GET', 'POST'], credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit(config.rateLimit.windowMs, config.rateLimit.maxRequests));

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/puzzles', puzzleRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'kyChess Server', version: '1.0.0' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

setupGameSocket(io);
PuzzleModel.seed();

httpServer.listen(config.port, () => {
  console.log('');
  console.log('  ♔ ═══════════════════════════════════ ♔');
  console.log('  ║                                       ║');
  console.log('  ║     kyChess Server v1.0.0              ║');
  console.log(`  ║     Running on port ${config.port}              ║`);
  console.log('  ║     Ready for connections               ║');
  console.log('  ║                                       ║');
  console.log('  ♔ ═══════════════════════════════════ ♔');
  console.log('');
});