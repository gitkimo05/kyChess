import { Router } from 'express';
import { GameModel } from '../models/Game';

const router = Router();

router.get('/:id', (req, res) => {
  const game = GameModel.findById(req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json(game);
});

router.get('/user/:userId', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const games = GameModel.findByUser(parseInt(req.params.userId), limit, offset);
  res.json(games);
});

router.get('/', (_req, res) => {
  res.json(GameModel.getRecentGames());
});

export default router;