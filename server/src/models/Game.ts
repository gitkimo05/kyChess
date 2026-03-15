import { UserModel } from './User';

const db = UserModel.getDb();

export interface GameRow {
  id: string;
  white_id: number;
  black_id: number;
  white_username: string;
  black_username: string;
  pgn: string;
  fen: string;
  moves: string;
  result: string;
  time_control: string;
  initial_time: number;
  increment: number;
  white_rating: number;
  black_rating: number;
  white_rating_change: number;
  black_rating_change: number;
  category: string;
  started_at: string;
  ended_at: string | null;
  termination: string;
  is_rated: number;
}

export class GameModel {
  static create(game: Partial<GameRow>): void {
    db.prepare(`
      INSERT INTO games (id, white_id, black_id, white_username, black_username,
        time_control, initial_time, increment, white_rating, black_rating, category, is_rated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      game.id, game.white_id, game.black_id, game.white_username, game.black_username,
      game.time_control, game.initial_time, game.increment,
      game.white_rating, game.black_rating, game.category, game.is_rated ?? 1
    );
  }

  static update(id: string, data: Partial<GameRow>): void {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE games SET ${fields} WHERE id = ?`).run(...values, id);
  }

  static findById(id: string): GameRow | undefined {
    return db.prepare('SELECT * FROM games WHERE id = ?').get(id) as GameRow | undefined;
  }

  static findByUser(userId: number, limit = 20, offset = 0): GameRow[] {
    return db.prepare(`
      SELECT * FROM games WHERE (white_id = ? OR black_id = ?) AND result != '*'
      ORDER BY started_at DESC LIMIT ? OFFSET ?
    `).all(userId, userId, limit, offset) as GameRow[];
  }

  static getRecentGames(limit = 20): GameRow[] {
    return db.prepare('SELECT * FROM games WHERE result != \'*\' ORDER BY started_at DESC LIMIT ?').all(limit) as GameRow[];
  }

  static getActiveGamesCount(): number {
    return (db.prepare("SELECT COUNT(*) as count FROM games WHERE result = '*'").get() as any).count;
  }
}