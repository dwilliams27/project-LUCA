import React from 'react';
import type { LucaItem } from '@/services/types/inventory.service.types';
import { AgentStatNames, StatToDisplayNameMap } from '@/services/types/agent.service.types';
import { UI_Z_PANEL } from '@/utils/constants';

interface ItemInfoPanelProps {
  item: LucaItem;
  className?: string;
}

export const ItemInfoPanel: React.FC<ItemInfoPanelProps> = ({ item, className }) => {
  const stats = item.calculateModifiers();

  const getStatColor = (statName: AgentStatNames, value: number): string => {
    let colorClass = 'text-emerald-400';
    
    switch (statName) {
      case AgentStatNames.DAMAGE:
        return value > 0.05 ? 'text-red-400' : 'text-emerald-400';
      case AgentStatNames.DEFENSE:
        return value > 0.01 ? 'text-blue-400' : 'text-emerald-400';
      case AgentStatNames.SPEED:
        return value > 1 ? 'text-purple-400' : 'text-emerald-400';
      default:
        return colorClass;
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-emerald-700 shadow-lg p-4 absolute right-[100%] w-[200px] h-[400px] ${className ? className : ''}`} style={{ zIndex: UI_Z_PANEL }}>
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-emerald-300 mb-4 border-b border-emerald-700 pb-2">
          {item.name}
        </h3>

        <h4 className="text-md mb-4">
          {item.description}
        </h4>
      </div>
      
      <div className="flex flex-col space-y-2">
        {Object.entries(stats).filter(([statName, _]) => statName in StatToDisplayNameMap).map(([statName, value]) => (
          <div 
            key={statName} 
            className="flex flex-col bg-gray-900/50 rounded-md p-3 transition-all duration-200 hover:bg-emerald-900/20"
          >
            <span className="text-gray-300 text-sm">{StatToDisplayNameMap[statName]}</span>
            <span className={`text-lg font-bold ${getStatColor(statName as AgentStatNames, value)}`}>
              {value.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
