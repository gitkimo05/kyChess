import { ChessBoard } from '../components/board/ChessBoard';
import { MoveHistory } from '../components/board/MoveHistory';
import { PlayerInfo } from '../components/board/PlayerInfo';
import { GameControls } from '../components/board/GameControls';
import { GameChat } from '../components/chat/GameChat';
import { useGame } from '../hooks/useGame';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { getResultText } from '../utils/chess';

export function Play() {
  const { game, fen, moveHistory, gameOver, whiteTime, blackTime, handleMove, handleResign, handleOfferDraw, handleAcceptDraw, handleDeclineDraw, resetGame } = useGame();
  const { sendChat } = useSocket();
  const chatMessages = useGameStore(s => s.chatMessages);
  const drawOffered = useGameStore(s => s.drawOffered);

  if (!game) return null;

  const isWhite = game.color === 'white';
  const topPlayer = isWhite ? game.black : game.white;
  const bottomPlayer = isWhite ? game.white : game.black;
  const topTime = isWhite ? blackTime : whiteTime;
  const bottomTime = isWhite ? whiteTime : blackTime;
  const turn = fen.split(' ')[1];
  const isTopTurn = (turn === 'w' && !isWhite) || (turn === 'b' && isWhite);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
        <div className="space-y-2 w-full max-w-[560px]">
          <PlayerInfo username={topPlayer.username} rating={topPlayer.rating} time={topTime} isActive={!gameOver} isPlayerTurn={isTopTurn} color={isWhite ? 'black' : 'white'} ratingChange={gameOver ? (isWhite ? gameOver.blackRatingChange : gameOver.whiteRatingChange) : undefined} />
          <ChessBoard fen={fen} orientation={game.color} onMove={gameOver ? undefined : handleMove} interactive={!gameOver} />
          <PlayerInfo username={bottomPlayer.username} rating={bottomPlayer.rating} time={bottomTime} isActive={!gameOver} isPlayerTurn={!isTopTurn} color={isWhite ? 'white' : 'black'} ratingChange={gameOver ? (isWhite ? gameOver.whiteRatingChange : gameOver.blackRatingChange) : undefined} />
        </div>
        <div className="w-full lg:w-72 space-y-3">
          {gameOver && <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-center"><p className="text-lg font-bold text-white">{getResultText(gameOver.result, gameOver.termination)}</p></div>}
          <GameControls onResign={handleResign} onOfferDraw={handleOfferDraw} drawOffered={drawOffered} onAcceptDraw={handleAcceptDraw} onDeclineDraw={handleDeclineDraw} gameOver={!!gameOver} onNewGame={resetGame} />
          <MoveHistory moves={moveHistory} />
          <GameChat messages={chatMessages} onSend={(msg) => sendChat(game.gameId, msg)} />
        </div>
      </div>
    </div>
  );
}