// src/components/Match.jsx
import React from 'react';

const Match = ({ match, onWin }) => {
  const isBye = match.player1 && match.player1.id === 'bye';
  const hasWinner = match.winner && match.winner.id !== null;
  
  if (!match.player1 && !match.player2) {
    return (
      <div className="bg-gray-800 text-gray-400 rounded-lg p-3 my-2 shadow-lg w-full flex items-center justify-center h-20">
        Menunggu Pemenang
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white rounded-lg p-3 my-2 shadow-lg w-full">
      <div className="flex justify-between items-center text-sm font-semibold mb-1">
        <span>Pertandingan {match.id.slice(match.id.indexOf('-') + 1)}</span>
        {hasWinner && <span className="text-green-400">Pemenang!</span>}
      </div>
      <div className="flex flex-col space-y-1">
        <button
          onClick={() => onWin(match.id, match.player1.id)}
          disabled={isBye || hasWinner || !match.player1?.id}
          className={`flex justify-between p-2 rounded-md transition-all duration-200
            ${hasWinner && match.winner.id === match.player1.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}
            ${isBye || hasWinner || !match.player1?.id ? 'cursor-not-allowed opacity-70' : ''}`}
        >
          <span className="truncate">{match.player1?.nama || 'TBD'}</span>
          {hasWinner && match.winner.id === match.player1.id && <span className="text-sm">🏆</span>}
        </button>
        <button
          onClick={() => onWin(match.id, match.player2.id)}
          disabled={isBye || hasWinner || !match.player2?.id}
          className={`flex justify-between p-2 rounded-md transition-all duration-200
            ${hasWinner && match.winner.id === match.player2.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}
            ${isBye || hasWinner || !match.player2?.id ? 'cursor-not-allowed opacity-70' : ''}`}
        >
          <span className="truncate">{match.player2?.nama || 'TBD'}</span>
          {hasWinner && match.winner.id === match.player2.id && <span className="text-sm">🏆</span>}
        </button>
      </div>
    </div>
  );
};

export default Match;
