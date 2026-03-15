import { Timer } from '../ui/Timer';

interface PlayerInfoProps { username: string; rating: number; time: number; isActive: boolean; isPlayerTurn: boolean; color: 'white' | 'black'; ratingChange?: number; }

export function PlayerInfo({ username, rating, time, isActive, isPlayerTurn, color, ratingChange }: PlayerInfoProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${isPlayerTurn ? 'bg-gray-800/80 ring-1 ring-primary-500/30' : 'bg-gray-800/30'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${color === 'white' ? 'bg-white text-black' : 'bg-gray-900 text-white border border-gray-600'}`}>
          {color === 'white' ? '♔' : '♚'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{username}</span>
            <span className="text-sm text-gray-400">({rating})</span>
          </div>
          {ratingChange !== undefined && ratingChange !== 0 && <span className={`text-xs font-medium ${ratingChange > 0 ? 'text-green-400' : 'text-red-400'}`}>{ratingChange > 0 ? '+' : ''}{ratingChange}</span>}
        </div>
      </div>
      <Timer time={time} isActive={isActive} isPlayerTurn={isPlayerTurn} />
    </div>
  );
}