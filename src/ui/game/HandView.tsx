import type { CardData } from '@/types';
import React from 'react';

interface HandViewProps {
  cards: CardData[];
}

export const HandView: React.FC<HandViewProps> = ({ cards }) => {
  return (
    <div className="h-full flex items-center justify-center gap-2 px-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="h-[90%] aspect-[2.5/3.5] bg-gray-700 rounded-lg p-2 hover:scale-110 transition-transform cursor-pointer"
        >
          <div className="text-sm font-bold text-gray-200">{card.name}</div>
          <div className="text-xs text-gray-300 mt-1">{card.description}</div>
        </div>
      ))}
    </div>
  );
};
