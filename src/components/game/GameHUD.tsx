import { MenuButton } from '@/components/ui/MenuButton';
import { useServiceStore, gameStore } from '@/store/gameStore';
import React from 'react';
import { AgentService } from '@/services/AgentService';

interface GameHUDProps {
  children: React.ReactNode;
}

const TOP_H = 10;
const BOTTOM_H = 20;

const useAgentStore = () => gameStore(state => state.agents);

const ChatLog: React.FC = () => {
  const { agentMap } = useAgentStore();
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium mb-2">Agent Thoughts</h3>
      <div className="flex-grow overflow-y-auto">
        {Object.values(agentMap).length === 0 ? (
          <div className="text-gray-500 italic">No agents present</div>
        ) : (
          <div className="space-y-4">
            {Object.values(agentMap).map(agent => (
              <div key={agent.id} className="border border-gray-700 rounded-md p-2">
                <div className="font-medium text-blue-400 mb-1">Agent {agent.id}</div>
                <ul className="space-y-1">
                  {agent.mental.recentThoughts.length > 0 ? (
                    agent.mental.recentThoughts.map((thought, idx) => (
                      <li key={idx} className="text-sm border-l-2 border-gray-600 pl-2">{thought}</li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 italic">No thoughts yet</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
          <ChatLog />
        </div>
      </div>

      <div className="h-20 w-full bg-gray-900 border-t border-gray-800 p-4"  style={{ height: `${BOTTOM_H}%` }}>
        Bottom stuff
      </div>
    </div>
  );
};
