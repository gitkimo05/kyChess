import { Chess } from 'chess.js';
import { v4 as uuidv4 } from 'uuid';
import { GameModel } from '../models/Game';
import { UserModel } from '../models/User';
import { calculateNewRating } from '../utils/rating';

export interface ActiveGame {
  id: string;
  chess: Chess;
  whiteId: number;
  blackId: number;
  whiteUsername: string;
  blackUsername: string;
  whiteTime: number;
  blackTime: number;
  increment: number;
  initialTime: number;
  timeControl: string;
  category: string;
  isRated: boolean;
  lastMoveTime: number;
  moves: string[];
  drawOffer: 'white' | 'black' | null;
  status: 'playing' | 'ended';
}

export class GameService {
  private static activeGames = new Map<string, ActiveGame>();
  private static playerGameMap = new Map<number, string>();

  static getCategory(initialTime: number, increment: number): string {
    const totalTime = initialTime + 40 * increment;
    if (totalTime < 180) return 'bullet';
    if (totalTime < 600) return 'blitz';
    if (totalTime < 1800) return 'rapid';
    return 'classical';
  }

  static createGame(whiteId: number, blackId: number, whiteUsername: string, blackUsername: string, timeControl: string, initialTime: number, increment: number): ActiveGame {
    const id = uuidv4();
    const category = this.getCategory(initialTime, increment);
    const whiteUser = UserModel.findById(whiteId);
    const blackUser = UserModel.findById(blackId);

    const game: ActiveGame = {
      id, chess: new Chess(), whiteId, blackId, whiteUsername, blackUsername,
      whiteTime: initialTime * 1000, blackTime: initialTime * 1000,
      increment, initialTime, timeControl, category, isRated: true,
      lastMoveTime: Date.now(), moves: [], drawOffer: null, status: 'playing',
    };

    this.activeGames.set(id, game);
    this.playerGameMap.set(whiteId, id);
    this.playerGameMap.set(blackId, id);

    GameModel.create({
      id, white_id: whiteId, black_id: blackId, white_username: whiteUsername, black_username: blackUsername,
      time_control: timeControl, initial_time: initialTime, increment,
      white_rating: whiteUser?.[`${category}_rating` as keyof typeof whiteUser] as number || 1500,
      black_rating: blackUser?.[`${category}_rating` as keyof typeof blackUser] as number || 1500,
      category, is_rated: 1,
    });

    return game;
  }

  static makeMove(gameId: string, userId: number, from: string, to: string, promotion?: string): any {
    const game = this.activeGames.get(gameId);
    if (!game || game.status === 'ended') return { success: false, error: 'Game not found or ended' };

    const isWhite = userId === game.whiteId;
    const turn = game.chess.turn();
    if ((turn === 'w' && !isWhite) || (turn === 'b' && isWhite)) return { success: false, error: 'Not your turn' };

    const now = Date.now();
    const elapsed = now - game.lastMoveTime;

    if (turn === 'w') {
      game.whiteTime -= elapsed;
      if (game.whiteTime <= 0) return this.endGame(gameId, '0-1', 'Time out');
      game.whiteTime += game.increment * 1000;
    } else {
      game.blackTime -= elapsed;
      if (game.blackTime <= 0) return this.endGame(gameId, '1-0', 'Time out');
      game.blackTime += game.increment * 1000;
    }
    game.lastMoveTime = now;

    try {
      const move = game.chess.move({ from, to, promotion: promotion || 'q' });
      if (!move) return { success: false, error: 'Invalid move' };

      game.moves.push(move.san);
      game.drawOffer = null;

      if (game.chess.isGameOver()) {
        let result = '1/2-1/2';
        let termination = 'Draw';
        if (game.chess.isCheckmate()) {
          result = game.chess.turn() === 'w' ? '0-1' : '1-0';
          termination = 'Checkmate';
        } else if (game.chess.isStalemate()) termination = 'Stalemate';
        else if (game.chess.isThreefoldRepetition()) termination = 'Repetition';
        else if (game.chess.isInsufficientMaterial()) termination = 'Insufficient material';
        else if (game.chess.isDraw()) termination = '50-move rule';
        return this.endGame(gameId, result, termination);
      }

      return { success: true, fen: game.chess.fen(), san: move.san, whiteTime: game.whiteTime, blackTime: game.blackTime };
    } catch {
      return { success: false, error: 'Invalid move' };
    }
  }

  static endGame(gameId: string, result: string, termination: string): any {
    const game = this.activeGames.get(gameId);
    if (!game) return { success: false, error: 'Game not found' };
    game.status = 'ended';

    let whiteRatingChange = 0, blackRatingChange = 0, newWhiteRating = 0, newBlackRating = 0;

    if (game.isRated && game.moves.length >= 2) {
      const whiteUser = UserModel.findById(game.whiteId);
      const blackUser = UserModel.findById(game.blackId);

      if (whiteUser && blackUser) {
        const wr = UserModel.getRating(whiteUser, game.category);
        const br = UserModel.getRating(blackUser, game.category);
        const whiteScore = result === '1-0' ? 1 : result === '0-1' ? 0 : 0.5;

        const nwr = calculateNewRating(wr, br, whiteScore);
        const nbr = calculateNewRating(br, wr, 1 - whiteScore);

        UserModel.updateRating(game.whiteId, game.category, nwr);
        UserModel.updateRating(game.blackId, game.category, nbr);

        whiteRatingChange = nwr.rating - wr.rating;
        blackRatingChange = nbr.rating - br.rating;
        newWhiteRating = nwr.rating;
        newBlackRating = nbr.rating;

        if (result === '1-0') { UserModel.incrementStats(game.whiteId, 'win'); UserModel.incrementStats(game.blackId, 'loss'); }
        else if (result === '0-1') { UserModel.incrementStats(game.whiteId, 'loss'); UserModel.incrementStats(game.blackId, 'win'); }
        else { UserModel.incrementStats(game.whiteId, 'draw'); UserModel.incrementStats(game.blackId, 'draw'); }
      }
    }

    GameModel.update(gameId, { pgn: game.chess.pgn(), fen: game.chess.fen(), moves: game.moves.join(' '), result, termination, ended_at: new Date().toISOString(), white_rating_change: whiteRatingChange, black_rating_change: blackRatingChange });

    this.playerGameMap.delete(game.whiteId);
    this.playerGameMap.delete(game.blackId);

    return { success: true, gameOver: true, result, termination, fen: game.chess.fen(), whiteTime: game.whiteTime, blackTime: game.blackTime, whiteRatingChange, blackRatingChange, newWhiteRating, newBlackRating };
  }

  static getGame(gameId: string): ActiveGame | undefined { return this.activeGames.get(gameId); }
  static getPlayerGame(userId: number): string | undefined { return this.playerGameMap.get(userId); }
  static getActiveGamesCount(): number { return this.activeGames.size; }
}