import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader } from '../components/ui/Loader';

export function Leaderboard() {
  const [category, setCategory] = useState('blitz');
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(true); api.getLeaderboard(category).then(setLeaders).catch(() => setLeaders([])).finally(() => setLoading(false)); }, [category]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">🏆 Leaderboard</h1>
      <div className="flex gap-2 mb-6">
        {['bullet', 'blitz', 'rapid', 'classical', 'puzzle'].map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${category === cat ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{cat}</button>
        ))}
      </div>
      {loading ? <Loader /> : leaders.length === 0 ? <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-3">🏅</p><p>No players ranked yet</p></div> : (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-800 text-gray-400 text-sm"><th className="px-4 py-3 text-left">#</th><th className="px-4 py-3 text-left">Player</th><th className="px-4 py-3 text-right">Rating</th><th className="px-4 py-3 text-right">Games</th></tr></thead>
            <tbody>{leaders.map((p, i) => (
              <tr key={p.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-4 py-3">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-gray-500">{i + 1}</span>}</td>
                <td className="px-4 py-3 font-medium text-white">{p.username}</td>
                <td className="px-4 py-3 text-right font-bold text-primary-400">{p.rating}</td>
                <td className="px-4 py-3 text-right text-gray-400">{p.games_played}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}