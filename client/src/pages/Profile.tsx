import { useAuth } from '../hooks/useAuth';

export function Profile() {
  const { user } = useAuth();
  if (!user) return null;
  const winRate = user.games_played > 0 ? Math.round((user.wins / user.games_played) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-primary-900/50 to-accent-900/50 border border-gray-700 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-3xl">👤</div>
          <div><h1 className="text-2xl font-bold text-white">{user.username}</h1><p className="text-gray-400">Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}</p></div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[{ l: 'Games', v: user.games_played, c: 'text-white' }, { l: 'Wins', v: user.wins, c: 'text-green-400' }, { l: 'Losses', v: user.losses, c: 'text-red-400' }, { l: 'Win Rate', v: `${winRate}%`, c: 'text-primary-400' }].map(s => (
          <div key={s.l} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-center"><p className={`text-xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-gray-400">{s.l}</p></div>
        ))}
      </div>
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">📊 Ratings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[{ l: '⚡ Bullet', v: user.bullet_rating }, { l: '🔥 Blitz', v: user.blitz_rating }, { l: '🕐 Rapid', v: user.rapid_rating }, { l: '🏛️ Classical', v: user.classical_rating }, { l: '🧩 Puzzle', v: user.puzzle_rating }].map(r => (
            <div key={r.l} className="flex items-center justify-between bg-gray-800 rounded-xl p-4"><span className="text-gray-300 font-medium">{r.l}</span><span className="text-xl font-bold text-white">{r.v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}