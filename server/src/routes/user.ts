import { Router } from 'express';
import { UserModel } from '../models/User';

const router = Router();

router.get('/leaderboard/:category', (req, res) => {
  const validCategories = ['bullet', 'blitz', 'rapid', 'classical', 'puzzle'];
  const category = req.params.category;
  if (!validCategories.includes(category)) return res.status(400).json({ error: 'Invalid category' });

  const leaders = UserModel.getLeaderboard(category);
  res.json(leaders.map(u => ({
    id: u.id, username: u.username, rating: (u as any)[`${category}_rating`], games_played: u.games_played, country: u.country,
  })));
});

router.get('/online-count', (_req, res) => {
  res.json({ count: UserModel.getOnlineCount() });
});

router.get('/:username', (req, res) => {
  const user = UserModel.findByUsername(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ id: user.id, username: user.username, bullet_rating: user.bullet_rating, blitz_rating: user.blitz_rating, rapid_rating: user.rapid_rating, classical_rating: user.classical_rating, puzzle_rating: user.puzzle_rating, games_played: user.games_played, wins: user.wins, losses: user.losses, draws: user.draws, country: user.country, bio: user.bio, created_at: user.created_at, is_online: user.is_online });
});

export default router;