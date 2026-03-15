import { useEffect, useState, useRef } from 'react';
import { formatTimeDetailed } from '../../utils/time';

interface TimerProps { time: number; isActive: boolean; isPlayerTurn: boolean; }

export function Timer({ time, isActive, isPlayerTurn }: TimerProps) {
  const [displayTime, setDisplayTime] = useState(time);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => { setDisplayTime(time); lastTickRef.current = Date.now(); }, [time]);

  useEffect(() => {
    if (isActive && isPlayerTurn) {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastTickRef.current;
        lastTickRef.current = now;
        setDisplayTime(prev => Math.max(0, prev - elapsed));
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, isPlayerTurn]);

  const isCritical = displayTime < 10000;
  const isLow = displayTime < 30000;

  return (
    <div className={`font-mono text-2xl font-bold px-4 py-2 rounded-xl ${isPlayerTurn ? isCritical ? 'bg-red-900/80 text-red-300 animate-pulse' : isLow ? 'bg-yellow-900/60 text-yellow-300' : 'bg-primary-900/60 text-white' : 'bg-gray-800 text-gray-400'}`}>
      {formatTimeDetailed(displayTime)}
    </div>
  );
}