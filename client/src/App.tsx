import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Modal } from './components/ui/Modal';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Home } from './pages/Home';
import { Play } from './pages/Play';
import { Puzzles } from './pages/Puzzles';
import { Leaderboard } from './pages/Leaderboard';
import { Tournaments } from './pages/Tournaments';
import { Profile } from './pages/Profile';
import { Loader } from './components/ui/Loader';
import { useAuthStore } from './store/authStore';
import { useGameStore } from './store/gameStore';
import { useSocket } from './hooks/useSocket';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const { isLoading, checkAuth, isAuthenticated } = useAuthStore();
  const currentGame = useGameStore(s => s.currentGame);

  useSocket();

  useEffect(() => { checkAuth(); }, [checkAuth]);
  useEffect(() => { if (currentGame) setCurrentPage('play'); }, [currentGame]);

  if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader text="Loading kyChess..." /></div>;

  const handleNavigate = (page: string) => {
    if (['puzzles', 'profile'].includes(page) && !isAuthenticated) { setAuthModal('login'); return; }
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (currentGame && currentPage === 'play') return <Play />;
    switch (currentPage) {
      case 'home': return <Home onNavigate={handleNavigate} onShowAuth={setAuthModal} />;
      case 'play': return <Play />;
      case 'puzzles': return <Puzzles />;
      case 'leaderboard': return <Leaderboard />;
      case 'tournaments': return <Tournaments />;
      case 'profile': return <Profile />;
      default: return <Home onNavigate={handleNavigate} onShowAuth={setAuthModal} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Header currentPage={currentPage} onNavigate={handleNavigate} onShowAuth={setAuthModal} />
      <main className="pb-8">{renderPage()}</main>
      <Modal isOpen={authModal !== null} onClose={() => setAuthModal(null)} title={authModal === 'login' ? 'Sign In to kyChess' : 'Create Account'}>
        {authModal === 'login' ? <Login onSwitchToRegister={() => setAuthModal('register')} onSuccess={() => setAuthModal(null)} /> : <Register onSwitchToLogin={() => setAuthModal('login')} onSuccess={() => setAuthModal(null)} />}
      </Modal>
      <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">♔ kyChess — Free, open-source chess. No ads. Forever.</footer>
    </div>
  );
}