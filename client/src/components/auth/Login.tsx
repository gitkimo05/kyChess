import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface LoginProps { onSwitchToRegister: () => void; onSuccess: () => void; }

export function Login({ onSwitchToRegister, onSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(username, password); onSuccess(); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Username or Email</label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500" required />
      </div>
      <Button type="submit" className="w-full" isLoading={loading}>Sign In</Button>
      <p className="text-center text-sm text-gray-400">Don't have an account? <button type="button" onClick={onSwitchToRegister} className="text-primary-400 hover:text-primary-300 font-medium">Create one</button></p>
    </form>
  );
}