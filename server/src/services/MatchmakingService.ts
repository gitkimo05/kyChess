import { config } from '../config';

interface QueueEntry {
  userId: number;
  username: string;
  rating: number;
  timeControl: string;
  initialTime: number;
  increment: number;
  joinedAt: number;
  socketId: string;
}

export class MatchmakingService {
  private static queue: QueueEntry[] = [];

  static addToQueue(entry: QueueEntry): void {
    this.removeFromQueue(entry.userId);
    this.queue.push(entry);
  }

  static removeFromQueue(userId: number): void {
    this.queue = this.queue.filter(e => e.userId !== userId);
  }

  static findMatch(entry: QueueEntry): QueueEntry | null {
    const now = Date.now();
    const waitTime = now - entry.joinedAt;
    const expansions = Math.floor(waitTime / config.matchmaking.expandInterval);
    const ratingRange = config.matchmaking.ratingRange + expansions * config.matchmaking.expandAmount;

    for (const candidate of this.queue) {
      if (candidate.userId === entry.userId) continue;
      if (candidate.timeControl !== entry.timeControl) continue;
      if (Math.abs(candidate.rating - entry.rating) <= ratingRange) {
        this.removeFromQueue(candidate.userId);
        this.removeFromQueue(entry.userId);
        return candidate;
      }
    }
    return null;
  }

  static getQueueSize(): number { return this.queue.length; }
  static isInQueue(userId: number): boolean { return this.queue.some(e => e.userId === userId); }
}