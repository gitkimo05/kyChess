import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { GlickoRating } from '../utils/rating';
import { config } from '../config';
import path from 'path';
import fs from 'fs';

const dataDir = path.dirname(config.dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    last_seen TEXT DEFAULT (datetime('now')),
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    bullet_rating INTEGER DEFAULT 1500,
    bullet_rd REAL DEFAULT 350,
    bullet_vol REAL DEFAULT 0.06,
    blitz_rating INTEGER DEFAULT 1500,
    blitz_rd REAL DEFAULT 350,
    blitz_vol REAL DEFAULT 0.06,
    rapid_rating INTEGER DEFAULT 1500,
    rapid_rd REAL DEFAULT 350,
    rapid_vol REAL DEFAULT 0.06,
    classical_rating INTEGER DEFAULT 1500,
    classical_rd REAL DEFAULT 350,
    classical_vol REAL DEFAULT 0.06,
    puzzle_rating INTEGER DEFAULT 1500,
    puzzle_rd REAL DEFAULT 350,
    puzzle_vol REAL DEFAULT 0.06,
    country TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    is_online INTEGER DEFAULT 0,
    is_banned INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    white_id INTEGER REFERENCES users(id),
    black_id INTEGER REFERENCES users(id),
    white_username TEXT NOT NULL,
    black_username TEXT NOT NULL,
    pgn TEXT DEFAULT '',
    fen TEXT DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves TEXT DEFAULT '',
    result TEXT DEFAULT '*',
    time_control TEXT NOT NULL,
    initial_time INTEGER NOT NULL,
    increment INTEGER DEFAULT 0,
    white_rating INTEGER,
    black_rating INTEGER,
    white_rating_change INTEGER DEFAULT 0,
    black_rating_change INTEGER DEFAULT 0,
    category TEXT DEFAULT 'blitz',
    started_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT,
    termination TEXT DEFAULT '',
    is_rated INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS puzzles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fen TEXT NOT NULL,
    moves TEXT NOT NULL,
    rating INTEGER DEFAULT 1500,
    rd REAL DEFAULT 350,
    themes TEXT DEFAULT '',
    attempts INTEGER DEFAULT 0,
    successes INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_games_white ON games(white_id);
  CREATE INDEX IF NOT EXISTS idx_games_black ON games(black_id);
  CREATE INDEX IF NOT EXISTS idx_puzzles_rating ON puzzles(rating);
`);

export interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  last_seen: string;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  bullet_rating: number;
  bullet_rd: number;
  bullet_vol: number;
  blitz_rating: number;
  blitz_rd: number;
  blitz_vol: number;
  rapid_rating: number;
  rapid_rd: number;
  rapid_vol: number;
  classical_rating: number;
  classical_rd: number;
  classical_vol: number;
  puzzle_rating: number;
  puzzle_rd: number;
  puzzle_vol: number;
  country: string;
  bio: string;
  is_online: number;
  is_banned: number;
}

export class UserModel {
  static async create(username: string, email: string, password: string): Promise<UserRow> {
    const hash = await bcrypt.hash(password, 12);
    const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
    const result = stmt.run(username, email, hash);
    return this.findById(result.lastInsertRowid as number)!;
  }

  static findById(id: number): UserRow | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  }

  static findByUsername(username: string): UserRow | undefined {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as UserRow | undefined;
  }

  static findByEmail(email: string): UserRow | undefined {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
  }

  static async verifyPassword(user: UserRow, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  static getRating(user: UserRow, category: string): GlickoRating {
    return {
      rating: (user as any)[`${category}_rating`] || 1500,
      rd: (user as any)[`${category}_rd`] || 350,
      volatility: (user as any)[`${category}_vol`] || 0.06,
    };
  }

  static updateRating(userId: number, category: string, newRating: GlickoRating): void {
    db.prepare(`UPDATE users SET ${category}_rating = ?, ${category}_rd = ?, ${category}_vol = ? WHERE id = ?`)
      .run(newRating.rating, newRating.rd, newRating.volatility, userId);
  }

  static incrementStats(userId: number, result: 'win' | 'loss' | 'draw'): void {
    const field = result === 'win' ? 'wins' : result === 'loss' ? 'losses' : 'draws';
    db.prepare(`UPDATE users SET games_played = games_played + 1, ${field} = ${field} + 1 WHERE id = ?`).run(userId);
  }

  static setOnline(userId: number, online: boolean): void {
    db.prepare('UPDATE users SET is_online = ?, last_seen = datetime("now") WHERE id = ?').run(online ? 1 : 0, userId);
  }

  static getLeaderboard(category: string, limit: number = 50): UserRow[] {
    return db.prepare(`SELECT * FROM users WHERE ${category}_rd < 110 AND games_played >= 10 AND is_banned = 0 ORDER BY ${category}_rating DESC LIMIT ?`).all(limit) as UserRow[];
  }

  static getOnlineCount(): number {
    return (db.prepare('SELECT COUNT(*) as count FROM users WHERE is_online = 1').get() as any).count;
  }

  static getDb(): Database.Database {
    return db;
  }
}