import { useState, useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';

interface ChessBoardProps { fen: string; orientation: 'white' | 'black'; onMove?: (from: string, to: string, promotion?: string) => void; interactive?: boolean; }

const PIECES: Record<string, string> = { 'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙', 'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟' };
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function ChessBoard({ fen, orientation, onMove, interactive = true }: ChessBoardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [showPromo, setShowPromo] = useState<{ from: string; to: string } | null>(null);

  const chess = useMemo(() => { try { return new Chess(fen); } catch { return new Chess(); } }, [fen]);

  const board = useMemo(() => {
    const b: (null | { type: string; color: string })[][] = [];
    for (let r = 0; r < 8; r++) {
      const row: (null | { type: string; color: string })[] = [];
      for (let f = 0; f < 8; f++) {
        row.push(chess.get(`${FILES[f]}${RANKS[r]}` as any) ?? null);
      }
      b.push(row);
    }
    return b;
  }, [chess, fen]);

  const dispRanks = orientation === 'white' ? RANKS : [...RANKS].reverse();
  const dispFiles = orientation === 'white' ? FILES : [...FILES].reverse();

  const handleClick = useCallback((square: string) => {
    if (!interactive || !onMove) return;

    if (selected) {
      if (selected === square) { setSelected(null); setLegalMoves([]); return; }
      if (legalMoves.includes(square)) {
        const piece = chess.get(selected as any);
        const isProm = piece?.type === 'p' && ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'));
        if (isProm) { setShowPromo({ from: selected, to: square }); }
        else { onMove(selected, square); }
        setSelected(null); setLegalMoves([]);
        return;
      }
    }

    const piece = chess.get(square as any);
    if (piece && piece.color === chess.turn()) {
      setSelected(square);
      setLegalMoves(chess.moves({ square: square as any, verbose: true }).map(m => m.to));
    } else { setSelected(null); setLegalMoves([]); }
  }, [selected, legalMoves, chess, interactive, onMove]);

  return (
    <div className="relative select-none">
      <div className="grid grid-cols-8 border-2 border-gray-600 rounded-lg overflow-hidden shadow-2xl" style={{ aspectRatio: '1/1', maxWidth: '560px' }}>
        {dispRanks.map((rank, ri) =>
          dispFiles.map((file, fi) => {
            const square = `${file}${rank}`;
            const isLight = (FILES.indexOf(file) + RANKS.indexOf(rank)) % 2 === 0;
            const piece = board[RANKS.indexOf(rank)]?.[FILES.indexOf(file)];
            const isSel = selected === square;
            const isLegal = legalMoves.includes(square);

            return (
              <div key={square} onClick={() => handleClick(square)}
                className={`relative flex items-center justify-center cursor-pointer ${isLight ? 'bg-[#e8dcc8]' : 'bg-[#b58863]'} ${isSel ? 'ring-2 ring-cyan-400 ring-inset' : ''} hover:brightness-110`}
                style={{ aspectRatio: '1/1' }}>
                {fi === 0 && <span className={`absolute top-0.5 left-0.5 text-[10px] font-bold ${isLight ? 'text-[#b58863]' : 'text-[#e8dcc8]'}`}>{rank}</span>}
                {ri === 7 && <span className={`absolute bottom-0 right-1 text-[10px] font-bold ${isLight ? 'text-[#b58863]' : 'text-[#e8dcc8]'}`}>{file}</span>}
                {piece && <span className="text-3xl sm:text-4xl md:text-5xl leading-none">{PIECES[`${piece.color}${piece.type.toUpperCase()}`]}</span>}
                {isLegal && !piece && <div className="w-3 h-3 rounded-full bg-black/25" />}
                {isLegal && piece && <div className="absolute inset-0 border-4 border-black/25 rounded-sm" />}
              </div>
            );
          })
        )}
      </div>

      {showPromo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 flex gap-2">
            {['q', 'r', 'b', 'n'].map(p => (
              <button key={p} onClick={() => { onMove?.(showPromo.from, showPromo.to, p); setShowPromo(null); }}
                className="w-14 h-14 flex items-center justify-center text-4xl bg-gray-700 hover:bg-primary-600 rounded-lg">
                {PIECES[`${chess.turn()}${p.toUpperCase()}`]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}