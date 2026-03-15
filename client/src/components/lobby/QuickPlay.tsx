import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { TIME_CONTROLS } from '../../types';
import type { ServerStats } from '../../types';
import { useSocket } from '../../hooks/useSocket';
import { useGameStore } from '../../store/gameStore';
import { socketService } from '../../services/socket';

export function QuickPlay() {
  const [stats, setStats] = useState<ServerStats>({ onlinePlayers: 0, activeGames: 0, queueSize: 0 });
  const { seek, cancelSeek } = useSocket();
  const isSeeking = useGameStore(s => s.isSeeking);

  useEffect(() => {
    const handleStats = (data: ServerStats) => setStats(data);
    socketService.on('stats', handleStats);
    return () => { socketService.off('stats', handleStats); };
  }, []);

  const categories = ['Bullet', 'Blitz', 'Rapid'];
  const icons: Record<string, string> = { 'Bullet': '⚡', 'Blitz': '🔥', 'Rapid': '🕐' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span><b className="text-white">{stats.onlinePlayers}</b> online</span></div>
        <div><b className="text-white">{stats.activeGames}</b> games</div>
      </div>

      {isSeeking ? (
        <div className="bg-primary-900/30 border border-primary-500/30 rounded-2xl p-6 text-center animate-pulse-glow">
          <div className="w-16 h-16 mx-auto mb-3 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-semibold text-white mb-1">Finding opponent...</p>
          <p className="text-sm text-gray-400 mb-4">This usually takes a few seconds</p>
          <Button variant="secondary" size="sm" onClick={cancelSeek}>✕ Cancel</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <span>{icons[cat]}</span>
                <h3 className="text-sm font-semibold text-gray-300">{cat}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIME_CONTROLS.filter(tc => tc.category === cat).map(tc => (
                  <button key={tc.name} onClick={() => seek(tc.name, tc.initial, tc.increment)}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-primary-500/50 rounded-xl p-3 text-center transition-all group">
                    <div className="text-lg font-bold text-white group-hover:text-primary-400">{tc.label}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}