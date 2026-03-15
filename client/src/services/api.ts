const API_BASE = '/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null): void {
    this.token = token;
    if (token) localStorage.setItem('kychess_token', token);
    else localStorage.removeItem('kychess_token');
  }

  getToken(): string | null {
    if (!this.token) this.token = localStorage.getItem('kychess_token');
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers: { ...headers, ...options.headers } });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async register(username: string, email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });
    this.setToken(data.token);
    return data;
  }

  async login(username: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    this.setToken(data.token);
    return data;
  }

  async getMe() { return this.request<any>('/auth/me'); }
  logout(): void { this.setToken(null); }
  async getUser(username: string) { return this.request<any>(`/users/${username}`); }
  async getLeaderboard(category: string) { return this.request<any[]>(`/users/leaderboard/${category}`); }
  async getGame(id: string) { return this.request<any>(`/games/${id}`); }
  async getUserGames(userId: number, limit = 20, offset = 0) { return this.request<any[]>(`/games/user/${userId}?limit=${limit}&offset=${offset}`); }
  async getNextPuzzle() { return this.request<any>('/puzzles/next'); }
  async solvePuzzle(id: number, success: boolean) { return this.request<any>(`/puzzles/${id}/solve`, { method: 'POST', body: JSON.stringify({ success }) }); }
  async getTournaments() { return this.request<any[]>('/tournaments'); }
}

export const api = new ApiService();