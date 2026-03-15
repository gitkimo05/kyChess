import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSocket } from './useSocket';

export function useGame() {
  const game = useGameStore(s => s.currentGame);
  const fen = useGameStore(s => s.fen);
  const moveHistory = useGameStore(s => s.moveHistory);
  const gameOver = useGameStore(s => s.gameOver);
  const whiteTime = useGameStore(s => s.whiteTime);
  const blackTime = useGameStore(s => s.blackTime);
  const resetGame = useGameStore(s => s.resetGame);
  const { makeMove, resign, offerDraw, acceptDraw, declineDraw } = useSocket();

  const handleMove = useCallback((from: string, to: string, promotion?: string) => {
    if (!game) return;
    makeMove(game.gameId, from, to, promotion);
  }, [game, makeMove]);

  return {
    game, fen, moveHistory, gameOver, whiteTime, blackTime, resetGame,
    handleMove,
    handleResign: useCallback(() => { if (game) resign(game.gameId); }, [game, resign]),
    handleOfferDraw: useCallback(() => { if (game) offerDraw(game.gameId); }, [game, offerDraw]),
    handleAcceptDraw: () => game && acceptDraw(game.gameId),
    handleDeclineDraw: () => game && declineDraw(game.gameId),
  };
}