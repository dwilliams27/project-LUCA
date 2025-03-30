import { AgentConfigModal } from '@/components/ui/AgentConfigModal';
import { LucaButton } from '@/components/ui/LucaButton';
import { useModal } from '@/contexts/modal-context';
import { useAgentStore } from '@/store/game-store';
import React from 'react';

export const ChatLog: React.FC = () => {
  const { agentMap } = useAgentStore();
  const { openModal } = useModal();

  const openAgentConfigModal = (agentId: string) => {
    openModal(
      <AgentConfigModal agentId={agentId} />
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium mb-2">Agents</h3>
      <div
        className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-2"
      >
        {Object.values(agentMap).length === 0 ? (
          <div className="text-gray-500 italic">No agents present</div>
        ) : (
          <div className="space-y-4">
            {Object.values(agentMap).map(agent => (
              <div 
                key={agent.id} 
                className={`border border-gray-700 rounded-md p-2`}
              >
                <div className="font-medium text-blue-400 mb-1 flex justify-between items-center">
                  <span>Agent {agent.id} {agent.mental.acting || agent.mental.canAct ? '💭' : ''}</span>
                  <LucaButton onClick={() => openAgentConfigModal(agent.id)} className="ml-2">
                    Config
                  </LucaButton>
                </div>
                <ul className="space-y-1">
                  {agent.mental.recentThoughts.length > 0 ? (
                    agent.mental.recentThoughts.map((thought, idx) => (
                      <li key={idx} className="text-sm border-l-2 border-gray-600 pl-2">
                        <span className="text-xs font-medium text-blue-300">{thought.modelConfig.modelName}: </span>
                        <span>{thought.text}</span>
                      </li>
                    )
                  )) : (
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