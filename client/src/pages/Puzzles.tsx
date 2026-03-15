import { useState, useEffect, useCallback } from 'react';
import { ChessBoard } from '../components/board/ChessBoard';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { Chess } from 'chess.js';

interface PuzzleData { id: number; fen: string; moves: string[]; rating: number; themes: string[]; }

export function Puzzles() {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [chess, setChess] = useState<Chess | null>(null);
  const [moveIdx, setMoveIdx] = useState(0);
  const [status, setStatus] = useState<'solving' | 'correct' | 'wrong' | 'loading'>('loading');
  const [ratingChange, setRatingChange] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);

  const loadPuzzle = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await api.getNextPuzzle();
      setPuzzle(data);
      const c = new Chess(data.fen);
      if (data.moves.length > 0) { const m = data.moves[0]; c.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] }); }
      setChess(c); setMoveIdx(1); setStatus('solving');
    } catch { setStatus('loading'); }
  }, []);

  useEffect(() => { loadPuzzle(); }, [loadPuzzle]);

  const handleMove = async (from: string, to: string, promotion?: string) => {
    if (!puzzle || !chess || status !== 'solving') return;
    const expected = puzzle.moves[moveIdx];
    const moveStr = from + to + (promotion || '');

    if (moveStr.slice(0, 4) === expected.slice(0, 4)) {
      chess.move({ from, to, promotion });
      if (moveIdx + 1 >= puzzle.moves.length) {
        setStatus('correct');
        try { const r = await api.solvePuzzle(puzzle.id, true); setUserRating(r.newRating); setRatingChange(r.ratingChange); } catch {}
      } else {
        const next = puzzle.moves[moveIdx + 1];
        setTimeout(() => { chess.move({ from: next.slice(0, 2), to: next.slice(2, 4), promotion: next[4] }); setChess(new Chess(chess.fen())); setMoveIdx(prev => prev + 2); }, 300);
      }
      setChess(new Chess(chess.fen()));
    } else {
      setStatus('wrong');
      try { const r = await api.solvePuzzle(puzzle.id, false); setUserRating(r.newRating); setRatingChange(r.ratingChange); } catch {}
    }
  };

  if (status === 'loading' || !puzzle || !chess) return <Loader text="Loading puzzle..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        <div className="w-full max-w-[480px]">
          <ChessBoard fen={chess.fen()} orientation={chess.turn() === 'w' ? 'white' : 'black'} onMove={status === 'solving' ? handleMove : undefined} interactive={status === 'solving'} />
        </div>
        <div className="w-full lg:w-64 space-y-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">Puzzle Rating</p>
            <p className="text-2xl font-bold text-white">{puzzle.rating}</p>
          </div>
          {status === 'solving' && <div className="bg-primary-900/30 border border-primary-500/30 rounded-xl p-4 text-center"><p className="text-lg font-semibold text-white">{chess.turn() === 'w' ? 'White' : 'Black'} to move</p><p className="text-sm text-gray-400">Find the best move!</p></div>}
          {status === 'correct' && <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 text-center"><p className="text-3xl mb-2">✅</p><p className="text-lg font-bold text-green-300">Correct!</p>{ratingChange !== null && <p className="text-sm text-gray-400">Rating: {userRating} ({ratingChange > 0 ? '+' : ''}{ratingChange})</p>}<Button variant="success" className="mt-3 w-full" onClick={loadPuzzle}>Next Puzzle</Button></div>}
          {status === 'wrong' && <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-center"><p className="text-3xl mb-2">❌</p><p className="text-lg font-bold text-red-300">Incorrect</p>{ratingChange !== null && <p className="text-sm text-gray-400">Rating: {userRating} ({ratingChange > 0 ? '+' : ''}{ratingChange})</p>}<Button variant="primary" className="mt-3 w-full" onClick={loadPuzzle}>Try Another</Button></div>}
        </div>
      </div>
    </div>
  );
}