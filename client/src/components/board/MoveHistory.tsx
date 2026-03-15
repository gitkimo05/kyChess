import { useRef, useEffect } from 'react';

export function MoveHistory({ moves }: { moves: string[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [moves.length]);

  const pairs: [string, string | undefined][] = [];
  for (let i = 0; i < moves.length; i += 2) pairs.push([moves[i], moves[i + 1]]);

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="px-3 py-2 bg-gray-800 border-b border-gray-700"><h3 className="text-sm font-semibold text-gray-300">Moves</h3></div>
      <div className="max-h-64 overflow-y-auto p-2">
        {pairs.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No moves yet</p> : pairs.map(([w, b], i) => (
          <div key={i} className="flex items-center text-sm">
            <span className="w-8 text-gray-500 font-mono">{i + 1}.</span>
            <span className="w-20 text-white font-medium px-2">{w}</span>
            {b && <span className="w-20 text-gray-300 font-medium px-2">{b}</span>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}