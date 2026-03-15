import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface HeaderProps { currentPage: string; onNavigate: (page: string) => void; onShowAuth: (mode: 'login' | 'register') => void; }

export function Header({ currentPage, onNavigate, onShowAuth }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { id: 'home', label: '⚔️ Play' },
    { id: 'puzzles', label: '🧩 Puzzles' },
    { id: 'leaderboard', label: '📊 Leaderboard' },
  ];

  return (
    <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 hover:opacity-80">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg text-lg">♔</div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">kyChess</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === item.id ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-800">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-sm">👤</div>
                <span className="text-sm font-medium text-gray-200">{user.username}</span>
                <span className="text-xs text-gray-500">{user.blitz_rating}</span>
              </button>
              <button onClick={logout} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg" title="Logout">🚪</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onShowAuth('login')}>Sign In</Button>
              <Button variant="primary" size="sm" onClick={() => onShowAuth('register')}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}