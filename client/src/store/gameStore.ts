import { create } from 'zustand';
import type { GameData, GameOverData, ChatMessage } from '../types';

interface GameState {
  currentGame: GameData | null;
  fen: string;
  moveHistory: string[];
  whiteTime: number;
  blackTime: number;
  gameOver: GameOverData | null;
  isSeeking: boolean;
  chatMessages: ChatMessage[];
  drawOffered: boolean;
  setGame: (game: GameData) => void;
  updatePosition: (fen: string, san: string, whiteTime: number, blackTime: number) => void;
  setGameOver: (data: GameOverData) => void;
  setSeeking: (seeking: boolean) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setDrawOffered: (offered: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moveHistory: [],
  whiteTime: 0,
  blackTime: 0,
  gameOver: null,
  isSeeking: false,
  chatMessages: [],
  drawOffered: false,

  setGame: (game) => set({ currentGame: game, fen: game.fen, moveHistory: [], whiteTime: game.initialTime, blackTime: game.initialTime, gameOver: null, chatMessages: [], drawOffered: false }),
  updatePosition: (fen, san, whiteTime, blackTime) => set((state) => ({ fen, moveHistory: [...state.moveHistory, san], whiteTime, blackTime })),
  setGameOver: (data) => set({ gameOver: data }),
  setSeeking: (seeking) => set({ isSeeking: seeking }),
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  setDrawOffered: (offered) => set({ drawOffered: offered }),
  resetGame: () => set({ currentGame: null, fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', moveHistory: [], whiteTime: 0, blackTime: 0, gameOver: null, isSeeking: false, chatMessages: [], drawOffered: false }),
}));