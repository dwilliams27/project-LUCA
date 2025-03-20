import React from 'react';
import { type AgentStats, AgentStatNames } from '@/services/types/agent.service.types';

interface AgentStatPanelProps {
  stats: AgentStats;
}

export const AgentStatPanel: React.FC<AgentStatPanelProps> = ({ stats }) => {
  const displayedStatLabels = {
    [AgentStatNames.MAX_HEALTH]: 'Max Health',
    [AgentStatNames.CUR_HEALTH]: 'Current Health',
    [AgentStatNames.DAMAGE_CHARGE_TICK]: 'Attack Speed',
    [AgentStatNames.DAMAGE]: 'Damage',
    [AgentStatNames.DEFENSE]: 'Defense',
    [AgentStatNames.SPEED]: 'Speed',
  };

  // Function to determine color based on stat value
  const getStatColor = (statName: AgentStatNames, value: number): string => {
    // Default color
    let colorClass = 'text-emerald-400';
    
    switch (statName) {
      case AgentStatNames.CUR_HEALTH:
        const healthRatio = stats[AgentStatNames.CUR_HEALTH] / stats[AgentStatNames.MAX_HEALTH];
        if (healthRatio < 0.3) return 'text-red-500';
        if (healthRatio < 0.7) return 'text-yellow-400';
        return 'text-green-500';
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
    <div className="bg-gray-800 rounded-lg border border-emerald-700 shadow-lg p-4 h-full">
      <h3 className="text-lg font-semibold text-emerald-300 mb-4 border-b border-emerald-700 pb-2">
        Agent Stats
      </h3>
      
      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
        {Object.entries(stats).map(([statName, value]) => (
          <div 
            key={statName} 
            className="flex flex-col bg-gray-900/50 rounded-md p-3 transition-all duration-200 hover:bg-emerald-900/20"
          >
            <span className="text-gray-300 text-sm">{displayedStatLabels[statName as AgentStatNames] || statName}</span>
            <span className={`text-lg font-bold ${getStatColor(statName as AgentStatNames, value)}`}>
              {value.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
