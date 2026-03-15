import { UserModel } from './User';

const db = UserModel.getDb();

export interface PuzzleRow {
  id: number;
  fen: string;
  moves: string;
  rating: number;
  rd: number;
  themes: string;
  attempts: number;
  successes: number;
}

export class PuzzleModel {
  static findByRating(targetRating: number, range: number = 200): PuzzleRow | undefined {
    return db.prepare('SELECT * FROM puzzles WHERE rating BETWEEN ? AND ? ORDER BY RANDOM() LIMIT 1')
      .get(targetRating - range, targetRating + range) as PuzzleRow | undefined;
  }

  static findById(id: number): PuzzleRow | undefined {
    return db.prepare('SELECT * FROM puzzles WHERE id = ?').get(id) as PuzzleRow | undefined;
  }

  static recordAttempt(id: number, success: boolean): void {
    if (success) {
      db.prepare('UPDATE puzzles SET attempts = attempts + 1, successes = successes + 1 WHERE id = ?').run(id);
    } else {
      db.prepare('UPDATE puzzles SET attempts = attempts + 1 WHERE id = ?').run(id);
    }
  }

  static seed(): void {
    const count = (db.prepare('SELECT COUNT(*) as c FROM puzzles').get() as any).c;
    if (count > 0) return;

    const puzzles = [
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', moves: 'h5f7', rating: 800, themes: 'mate,short' },
      { fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5', moves: 'f3e5 c6e5 d2d4', rating: 1000, themes: 'fork,knight' },
      { fen: '6k1/pp4p1/2p5/2bp4/8/P5Pb/1P3rrP/2BRRK2 b - - 0 1', moves: 'g2g1 f1g1 f2f1', rating: 1200, themes: 'mate,sacrifice' },
      { fen: 'r2qk2r/pb4pp/1n2Pb2/2B2p2/6P1/3B4/PPP2P1P/R2Q1RK1 b kq - 0 1', moves: 'b6c4 d3c4 d8d1 a1d1', rating: 1400, themes: 'exchange,knight' },
      { fen: 'r1bq1rk1/pp3ppp/2n1pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 8', moves: 'c4d5 e6d5 d4c5 b4c3', rating: 1600, themes: 'opening,pawn' },
      { fen: '3r2k1/p4ppp/2r1pn2/q1p1N3/8/1PP1Q3/P4PPP/R2R2K1 w - - 0 1', moves: 'e5f7 d8d1 a1d1 g8f7', rating: 1800, themes: 'sacrifice,exchange' },
      { fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 6', moves: 'c3a4 c5e7 a4c5 d6c5', rating: 1100, themes: 'opening,positional' },
      { fen: 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10', moves: 'c3d5 f6d5 e4d5 g4f3', rating: 1500, themes: 'tactics,pin' },
    ];

    const stmt = db.prepare('INSERT INTO puzzles (fen, moves, rating, themes) VALUES (?, ?, ?, ?)');
    const insertMany = db.transaction((items: typeof puzzles) => {
      for (const p of items) {
        stmt.run(p.fen, p.moves, p.rating, p.themes);
      }
    });
    insertMany(puzzles);
    console.log(`[kyChess] Seeded ${puzzles.length} puzzles`);
  }
}