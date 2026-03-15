import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { config } from '../config';
import { isValidEmail, isValidUsername, isValidPassword, sanitizeInput } from '../utils/validation';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

function generateToken(userId: number, username: string): string {
  return jwt.sign(
    { userId, username },
    config.jwtSecret as jwt.Secret,
    { expiresIn: '7d' as any }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const cleanUsername = sanitizeInput(username || '');
    const cleanEmail = sanitizeInput(email || '').toLowerCase();

    if (!isValidUsername(cleanUsername)) return res.status(400).json({ error: 'Username must be 3-20 characters' });
    if (!isValidEmail(cleanEmail)) return res.status(400).json({ error: 'Invalid email' });
    if (!isValidPassword(password)) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (UserModel.findByUsername(cleanUsername)) return res.status(409).json({ error: 'Username taken' });
    if (UserModel.findByEmail(cleanEmail)) return res.status(409).json({ error: 'Email already registered' });

    const user = await UserModel.create(cleanUsername, cleanEmail, password);
    const token = generateToken(user.id, user.username);

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, blitz_rating: 1500, rapid_rating: 1500, bullet_rating: 1500, classical_rating: 1500, puzzle_rating: 1500, games_played: 0, wins: 0, losses: 0, draws: 0 },
    });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = UserModel.findByUsername(username) || UserModel.findByEmail(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.is_banned) return res.status(403).json({ error: 'Account banned' });

    const valid = await UserModel.verifyPassword(user, password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id, user.username);
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, bullet_rating: user.bullet_rating, blitz_rating: user.blitz_rating, rapid_rating: user.rapid_rating, classical_rating: user.classical_rating, puzzle_rating: user.puzzle_rating, games_played: user.games_played, wins: user.wins, losses: user.losses, draws: user.draws },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = UserModel.findById(req.userId!);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ id: user.id, username: user.username, email: user.email, bullet_rating: user.bullet_rating, blitz_rating: user.blitz_rating, rapid_rating: user.rapid_rating, classical_rating: user.classical_rating, puzzle_rating: user.puzzle_rating, games_played: user.games_played, wins: user.wins, losses: user.losses, draws: user.draws, country: user.country, bio: user.bio, created_at: user.created_at });
});

export default router;