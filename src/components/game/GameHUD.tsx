import { MenuButton } from '@/components/ui/MenuButton';
import { useServiceStore } from '@/store/gameStore';
import React from 'react';
import { Agent, AgentService } from '@/services/AgentService';

interface GameHUDProps {
  children: React.ReactNode;
}

const TOP_H = 10;
const BOTTOM_H = 20;

export const GameHUD: React.FC<GameHUDProps> = ({ children }) => {
  const { gameServiceLocator } = useServiceStore();

  const addAgent = () => {
    const agentService = gameServiceLocator.getService(AgentService);

    agentService.createAgent({ x: Math.round(Math.random() * 5), y: Math.round(Math.random() * 5) });
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white overflow-hidden">
      <div className="w-full px-6 py-2 bg-gray-900 border-b border-gray-800" style={{ height: `${TOP_H}%` }}>
        <div className="flex justify-between items-center h-full">
          <div className="font-medium">
            Top stuff
          </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/3 bg-gray-900 border-r border-gray-800 p-4">
          <MenuButton onClick={addAgent}>
            Add Agent
          </MenuButton>
        </div>

        <div className="w-1/3 items-center overflow-hidden justify-center aspect-square p-4">
          {children}
        </div>

        <div className="w-1/3 flex-grow bg-gray-900 border-l border-gray-800 p-4">
          Right stuff
        </div>
      </div>

      <div className="h-20 w-full bg-gray-900 border-t border-gray-800 p-4"  style={{ height: `${BOTTOM_H}%` }}>
        Bottom stuff
      </div>
    </div>
  );
};
