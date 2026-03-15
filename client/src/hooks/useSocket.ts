import { useEffect, useRef } from 'react';
import { socketService } from '../services/socket';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';

export function useSocket() {
  const setGame = useGameStore(s => s.setGame);
  const updatePosition = useGameStore(s => s.updatePosition);
  const setGameOver = useGameStore(s => s.setGameOver);
  const setSeeking = useGameStore(s => s.setSeeking);
  const addChatMessage = useGameStore(s => s.addChatMessage);
  const setDrawOffered = useGameStore(s => s.setDrawOffered);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || initialized.current) return;
    initialized.current = true;

    socketService.connect();
    socketService.on('gameStart', (data: any) => { setGame(data); setSeeking(false); });
    socketService.on('moveMade', (data: any) => { updatePosition(data.fen, data.san, data.whiteTime, data.blackTime); });
    socketService.on('gameOver', (data: any) => { setGameOver(data); });
    socketService.on('seeking', () => { setSeeking(true); });
    socketService.on('seekCancelled', () => { setSeeking(false); });
    socketService.on('gameChatMessage', (data: any) => { addChatMessage(data); });
    socketService.on('drawOffered', () => { setDrawOffered(true); });
    socketService.on('drawDeclined', () => { setDrawOffered(false); });

    return () => { initialized.current = false; };
  }, [isAuthenticated]);

  return {
    seek: (timeControl: string, initialTime: number, increment: number) => { socketService.emit('seek', { timeControl, initialTime, increment }); },
    cancelSeek: () => { socketService.emit('cancelSeek'); },
    makeMove: (gameId: string, from: string, to: string, promotion?: string) => { socketService.emit('move', { gameId, from, to, promotion }); },
    resign: (gameId: string) => { socketService.emit('resign', { gameId }); },
    offerDraw: (gameId: string) => { socketService.emit('offerDraw', { gameId }); },
    acceptDraw: (gameId: string) => { socketService.emit('acceptDraw', { gameId }); },
    declineDraw: (gameId: string) => { socketService.emit('declineDraw', { gameId }); },
    sendChat: (gameId: string, message: string) => { socketService.emit('gameChat', { gameId, message }); },
  };
}