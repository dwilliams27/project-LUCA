import { useServiceStore, useDebugStore, useSetDisableLlm } from '@/store/game-store';
import React from 'react';
import { AgentService } from '@/services/agent.service';
import { LlmInfo } from '@/components/game/LlmInfo';
import { ChatLog } from '@/components/game/ChatLog';
import { AVAILABLE_MODELS, LLM_PROVIDERS, type LLMProvider } from '@/types/ipc-shared';
import { AGENT_MODEL } from '@/services/types/agent.service.types';
import { LucaButton } from '@/components/ui/LucaButton';

interface GameHUDProps {
  children: React.ReactNode;
}

const TOP_H = 10;
const BOTTOM_H = 20;

export const GameHUD: React.FC<GameHUDProps> = ({ children }) => {
  const { gameServiceLocator } = useServiceStore();
  const { disableLlm } = useDebugStore();
  const setDisableLlm = useSetDisableLlm();
  const [provider, setProvider] = React.useState<LLMProvider>(LLM_PROVIDERS.ANTHROPIC);
  const [model, setModel] = React.useState<string>(AVAILABLE_MODELS[LLM_PROVIDERS.ANTHROPIC][0]);
  const [randomPlacement, setRandomPlacement] = React.useState(false);

  const addAgent = () => {
    const agentService = gameServiceLocator.getService(AgentService);

    agentService.createAgent(
      { x: randomPlacement ? Math.round(Math.random() * 5) : 0, y: randomPlacement ? Math.round(Math.random() * 5) : 0 },
      {
        [AGENT_MODEL.MAIN_THOUGHT]: {
          provider,
          modelName: model,
        }
      }
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white overflow-hidden">
      <div className="w-full px-6 py-2 bg-gray-900 border-b border-gray-800" style={{ height: `${TOP_H}%` }}>
        <div className="flex justify-between items-center h-full">
          <div className="font-medium">
            Project LUCA
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <input 
                type="checkbox" 
                id="disable-llm"
                checked={disableLlm} 
                onChange={(e) => setDisableLlm(e.target.checked)} 
                className="mr-2"
              />
              <label htmlFor="disable-llm" className="text-sm mr-2">Disable LLM</label>
              <input 
                type="checkbox" 
                id="random-placement"
                checked={randomPlacement} 
                onChange={() => setRandomPlacement(!randomPlacement)} 
                className="mr-2"
              />
              <label htmlFor="random-placement" className="text-sm">Random Placement</label>
            </div>
            <LlmInfo 
              provider={provider} 
              setProvider={setProvider} 
              model={model}
              setModel={setModel} 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/4 bg-gray-900 border-r border-gray-800 p-4">
          <LucaButton onClick={addAgent}>
            Add Agent
          </LucaButton>
        </div>

        <div className="w-2/4 items-center overflow-hidden justify-center aspect-square p-4">
          {children}
        </div>

        <div className="w-1/4 flex-grow bg-gray-900 border-l border-gray-800 p-4">
          <ChatLog />
        </div>
      </div>

      <div className="h-20 w-full bg-gray-900 border-t border-gray-800 p-4"  style={{ height: `${BOTTOM_H}%` }}>
        Bottom stuff
      </div>
    </div>
  );
};
