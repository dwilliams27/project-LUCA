import { ResourceType, type Resources } from '@/types';
import React from 'react';

interface ResourceBarProps {
  resources: Resources;
}

export const ResourceBar: React.FC<ResourceBarProps> = ({ resources }) => {
  return (
    <div className="flex gap-4">
      {Object.entries(resources).map(([type, amount]) => (
        <div key={type} className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full" style={{
            backgroundColor: getResourceColor(type as ResourceType)
          }} />
          <span className="text-gray-200">{amount}</span>
        </div>
      ))}
    </div>
  );
};

const getResourceColor = (type: ResourceType): string => {
  const colors: Record<ResourceType, string> = {
    [ResourceType.ENERGY]: '#FFD700',    // Gold
    [ResourceType.MINERALS]: '#A0522D',   // Brown
    [ResourceType.NUTRIENTS]: '#32CD32',  // Green
    [ResourceType.PROTEINS]: '#4169E1',   // Blue
    [ResourceType.SIGNALS]: '#FF69B4'     // Pink
  };
  return colors[type];
};
