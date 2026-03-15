import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { GameService } from '../services/GameService';
import { MatchmakingService } from '../services/MatchmakingService';
import { UserModel } from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

export function setupGameSocket(io: Server): void {
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next();
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: number; username: string };
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      next();
    } catch {
      next(new Error('Auth error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[Socket] Connected: ${socket.username || 'anon'}`);

    if (socket.userId) {
      UserModel.setOnline(socket.userId, true);
      socket.join(`user:${socket.userId}`);
    }

    const emitStats = () => {
      io.emit('stats', { onlinePlayers: UserModel.getOnlineCount(), activeGames: GameService.getActiveGamesCount(), queueSize: MatchmakingService.getQueueSize() });
    };
    emitStats();

    socket.on('seek', (data: { timeControl: string; initialTime: number; increment: number }) => {
      if (!socket.userId || !socket.username) return socket.emit('error', { message: 'Must be logged in' });
      if (GameService.getPlayerGame(socket.userId)) return socket.emit('error', { message: 'Already in a game' });

      const user = UserModel.findById(socket.userId);
      if (!user) return;

      const category = GameService.getCategory(data.initialTime, data.increment);
      const rating = UserModel.getRating(user, category).rating;

      const entry = { userId: socket.userId, username: socket.username, rating, timeControl: data.timeControl, initialTime: data.initialTime, increment: data.increment, joinedAt: Date.now(), socketId: socket.id };

      MatchmakingService.addToQueue(entry);
      socket.emit('seeking', { timeControl: data.timeControl });

      const opponent = MatchmakingService.findMatch(entry);
      if (opponent) {
        const whiteFirst = Math.random() < 0.5;
        const white = whiteFirst ? entry : opponent;
        const black = whiteFirst ? opponent : entry;

        const game = GameService.createGame(white.userId, black.userId, white.username, black.username, data.timeControl, data.initialTime, data.increment);

        const whiteSocket = io.sockets.sockets.get(white.socketId);
        const blackSocket = io.sockets.sockets.get(black.socketId);

        whiteSocket?.join(`game:${game.id}`);
        blackSocket?.join(`game:${game.id}`);

        const gameData = { gameId: game.id, white: { id: white.userId, username: white.username, rating: white.rating }, black: { id: black.userId, username: black.username, rating: black.rating }, timeControl: data.timeControl, initialTime: data.initialTime * 1000, increment: data.increment, fen: game.chess.fen() };

        whiteSocket?.emit('gameStart', { ...gameData, color: 'white' });
        blackSocket?.emit('gameStart', { ...gameData, color: 'black' });
        emitStats();
      }
    });

    socket.on('cancelSeek', () => {
      if (socket.userId) { MatchmakingService.removeFromQueue(socket.userId); socket.emit('seekCancelled'); }
    });

    socket.on('move', (data: { gameId: string; from: string; to: string; promotion?: string }) => {
      if (!socket.userId) return;
      const result = GameService.makeMove(data.gameId, socket.userId, data.from, data.to, data.promotion);

      if (result.success) {
        io.to(`game:${data.gameId}`).emit('moveMade', { from: data.from, to: data.to, promotion: data.promotion, san: result.san, fen: result.fen, whiteTime: result.whiteTime, blackTime: result.blackTime });
        if (result.gameOver) {
          io.to(`game:${data.gameId}`).emit('gameOver', { result: result.result, termination: result.termination, whiteRatingChange: result.whiteRatingChange, blackRatingChange: result.blackRatingChange, newWhiteRating: result.newWhiteRating, newBlackRating: result.newBlackRating });
          emitStats();
        }
      } else {
        socket.emit('moveError', { error: result.error });
      }
    });

    socket.on('resign', (data: { gameId: string }) => {
      if (!socket.userId) return;
      const game = GameService.getGame(data.gameId);
      if (!game) return;
      const result = game.whiteId === socket.userId ? '0-1' : '1-0';
      const endResult = GameService.endGame(data.gameId, result, 'Resignation');
      io.to(`game:${data.gameId}`).emit('gameOver', endResult);
      emitStats();
    });

    socket.on('offerDraw', (data: { gameId: string }) => {
      if (!socket.userId) return;
      const game = GameService.getGame(data.gameId);
      if (!game) return;
      const color = game.whiteId === socket.userId ? 'white' : 'black';
      game.drawOffer = color;
      const opponentId = color === 'white' ? game.blackId : game.whiteId;
      io.to(`user:${opponentId}`).emit('drawOffered', { gameId: data.gameId });
    });

    socket.on('acceptDraw', (data: { gameId: string }) => {
      if (!socket.userId) return;
      const endResult = GameService.endGame(data.gameId, '1/2-1/2', 'Agreement');
      io.to(`game:${data.gameId}`).emit('gameOver', endResult);
      emitStats();
    });

    socket.on('declineDraw', (data: { gameId: string }) => {
      if (!socket.userId) return;
      const game = GameService.getGame(data.gameId);
      if (!game) return;
      game.drawOffer = null;
      const opponentId = game.whiteId === socket.userId ? game.blackId : game.whiteId;
      io.to(`user:${opponentId}`).emit('drawDeclined', { gameId: data.gameId });
    });

    socket.on('gameChat', (data: { gameId: string; message: string }) => {
      if (!socket.username) return;
      const sanitized = data.message.slice(0, 500).replace(/</g, '&lt;').replace(/>/g, '&gt;');
      io.to(`game:${data.gameId}`).emit('gameChatMessage', { username: socket.username, message: sanitized, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        UserModel.setOnline(socket.userId, false);
        MatchmakingService.removeFromQueue(socket.userId);
        emitStats();
      }
    });
  });
}