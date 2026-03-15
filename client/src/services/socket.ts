import { io, Socket } from 'socket.io-client';
import { api } from './api';

class SocketService {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<(...args: any[]) => void>>();

  connect(): Socket {
    if (this.socket?.connected) return this.socket;
    const token = api.getToken();

    this.socket = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => console.log('[kyChess] Connected'));
    this.socket.on('disconnect', (reason) => console.log('[kyChess] Disconnected:', reason));

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(cb => this.socket!.on(event, cb));
    });

    return this.socket;
  }

  disconnect(): void { this.socket?.disconnect(); this.socket = null; }

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback);
  }

  emit(event: string, ...args: any[]): void { this.socket?.emit(event, ...args); }
  getSocket(): Socket | null { return this.socket; }
}

export const socketService = new SocketService();