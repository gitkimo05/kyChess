import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types';

interface GameChatProps { messages: ChatMessage[]; onSend: (message: string) => void; }

export function GameChat({ messages, onSend }: GameChatProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const handleSend = () => { if (input.trim()) { onSend(input.trim()); setInput(''); } };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 flex flex-col h-48">
      <div className="px-3 py-2 bg-gray-800 border-b border-gray-700"><h3 className="text-sm font-semibold text-gray-300">Chat</h3></div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm"><span className="font-medium text-primary-400">{msg.username}: </span><span className="text-gray-300">{msg.message}</span></div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-2 border-t border-gray-700 flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Type a message..." maxLength={500} />
        <button onClick={handleSend} className="p-1.5 bg-primary-600 hover:bg-primary-500 rounded-lg text-white text-sm">Send</button>
      </div>
    </div>
  );
}