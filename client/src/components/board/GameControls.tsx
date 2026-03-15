import { Button } from '../ui/Button';

interface GameControlsProps { onResign: () => void; onOfferDraw: () => void; drawOffered: boolean; onAcceptDraw: () => void; onDeclineDraw: () => void; gameOver: boolean; onNewGame: () => void; }

export function GameControls({ onResign, onOfferDraw, drawOffered, onAcceptDraw, onDeclineDraw, gameOver, onNewGame }: GameControlsProps) {
  if (gameOver) return <Button variant="primary" onClick={onNewGame} className="w-full">🔄 New Game</Button>;

  return (
    <div className="space-y-2">
      {drawOffered && (
        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-3 text-center">
          <p className="text-sm text-yellow-300 mb-2">Draw offered!</p>
          <div className="flex gap-2">
            <Button variant="success" size="sm" onClick={onAcceptDraw} className="flex-1">Accept</Button>
            <Button variant="danger" size="sm" onClick={onDeclineDraw} className="flex-1">Decline</Button>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onOfferDraw} className="flex-1">🤝 Draw</Button>
        <Button variant="danger" size="sm" onClick={onResign} className="flex-1">🏳️ Resign</Button>
      </div>
    </div>
  );
}