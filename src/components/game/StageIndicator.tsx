import type { EvolutionaryStage } from '@/types';
import React from 'react';

interface StageIndicatorProps {
  stage: EvolutionaryStage;
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({ stage }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400">Stage:</span>
      <span className="text-gray-200 font-bold">
        {stage.split('_').map(word => 
          word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ')}
      </span>
    </div>
  );
};
