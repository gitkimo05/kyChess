export interface User {
  id: number;
  username: string;
  email?: string;
  bullet_rating: number;
  blitz_rating: number;
  rapid_rating: number;
  classical_rating: number;
  puzzle_rating: number;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  country?: string;
  bio?: string;
  is_online?: boolean;
  created_at?: string;
}

export interface GameData {
  gameId: string;
  color: 'white' | 'black';
  white: { id: number; username: string; rating: number };
  black: { id: number; username: string; rating: number };
  timeControl: string;
  initialTime: number;
  increment: number;
  fen: string;
}

export interface MoveData {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  fen: string;
  whiteTime: number;
  blackTime: number;
}

export interface GameOverData {
  result: string;
  termination: string;
  whiteRatingChange?: number;
  blackRatingChange?: number;
  newWhiteRating?: number;
  newBlackRating?: number;
}

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: number;
}

export interface TimeControl {
  name: string;
  label: string;
  initial: number;
  increment: number;
  category: string;
}

export const TIME_CONTROLS: TimeControl[] = [
  { name: 'bullet1', label: '1+0', initial: 60, increment: 0, category: 'Bullet' },
  { name: 'bullet2', label: '2+1', initial: 120, increment: 1, category: 'Bullet' },
  { name: 'blitz3', label: '3+0', initial: 180, increment: 0, category: 'Blitz' },
  { name: 'blitz5', label: '5+0', initial: 300, increment: 0, category: 'Blitz' },
  { name: 'blitz5_3', label: '5+3', initial: 300, increment: 3, category: 'Blitz' },
  { name: 'rapid10', label: '10+0', initial: 600, increment: 0, category: 'Rapid' },
  { name: 'rapid15', label: '15+10', initial: 900, increment: 10, category: 'Rapid' },
  { name: 'rapid30', label: '30+0', initial: 1800, increment: 0, category: 'Rapid' },
];

export interface ServerStats {
  onlinePlayers: number;
  activeGames: number;
  queueSize: number;
}