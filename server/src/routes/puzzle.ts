import { Router, Response } from 'express';
import { PuzzleModel } from '../models/Puzzle';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { UserModel } from '../models/User';
import { calculateNewRating } from '../utils/rating';

const router = Router();

router.get('/next', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = UserModel.findById(req.userId!);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const puzzle = PuzzleModel.findByRating(user.puzzle_rating);
  if (!puzzle) return res.status(404).json({ error: 'No puzzles available' });

  res.json({ id: puzzle.id, fen: puzzle.fen, moves: puzzle.moves.split(' '), rating: puzzle.rating, themes: puzzle.themes.split(',') });
});

router.post('/:id/solve', authMiddleware, (req: AuthRequest, res: Response) => {
  const puzzleId = String(req.params.id);
  const puzzle = PuzzleModel.findById(parseInt(puzzleId));
  if (!puzzle) return res.status(404).json({ error: 'Puzzle not found' });

  const user = UserModel.findById(req.userId!);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { success } = req.body;
  const playerRating = UserModel.getRating(user, 'puzzle');
  const puzzleRating = { rating: puzzle.rating, rd: puzzle.rd, volatility: 0.06 };

  const newPlayerRating = calculateNewRating(playerRating, puzzleRating, success ? 1 : 0);
  UserModel.updateRating(user.id, 'puzzle', newPlayerRating);
  PuzzleModel.recordAttempt(puzzle.id, success);

  res.json({ newRating: newPlayerRating.rating, ratingChange: newPlayerRating.rating - playerRating.rating });
});

export default router;