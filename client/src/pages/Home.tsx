import { QuickPlay } from '../components/lobby/QuickPlay';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

interface HomeProps { onNavigate: (page: string) => void; onShowAuth: (mode: 'login' | 'register') => void; }

export function Home({ onNavigate, onShowAuth }: HomeProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          {isAuthenticated ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">⚔️ Quick Play</h2>
              <QuickPlay />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-xl text-4xl">♔</div>
              <h1 className="text-4xl font-bold text-white mb-3">Welcome to <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">kyChess</span></h1>
              <p className="text-gray-400 mb-6 text-lg">The future of online chess. Free, open-source, no ads.</p>
              <div className="flex gap-3 justify-center">
                <Button variant="primary" size="lg" onClick={() => onShowAuth('register')}>Play Now — It's Free</Button>
                <Button variant="secondary" size="lg" onClick={() => onShowAuth('login')}>Sign In</Button>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[{ icon: '⚡', label: 'Blazing Fast' }, { icon: '🛡️', label: 'No Ads' }, { icon: '🌍', label: 'Open Source' }].map(f => (
                  <div key={f.label} className="text-center"><span className="text-2xl">{f.icon}</span><p className="text-sm font-semibold text-white mt-1">{f.label}</p></div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {[
            { icon: '🧩', title: 'Puzzles', desc: 'Adaptive puzzles that match your level', page: 'puzzles', color: 'from-yellow-500 to-orange-500' },
            { icon: '🏆', title: 'Tournaments', desc: 'Coming soon! Live tournaments.', page: 'tournaments', color: 'from-purple-500 to-pink-500' },
            { icon: '📊', title: 'Leaderboard', desc: 'See the best players', page: 'leaderboard', color: 'from-green-500 to-emerald-500' },
          ].map(({ icon, title, desc, page, color }) => (
            <button key={title} onClick={() => onNavigate(page)} className="w-full bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-gray-600 rounded-xl p-5 text-left transition-all group flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shrink-0 text-2xl group-hover:scale-110 transition-transform shadow-lg`}>{icon}</div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-primary-400">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}