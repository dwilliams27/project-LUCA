import React from 'react';
import { DraggableGrid } from './DraggableGrid';
import { useModal } from '@/contexts/modal-context';
import { AgentStatPanel } from './AgentStatPanel';

import type { Agent } from '@/services/types/agent.service.types';
import type { GridItem } from '@/components/ui/DraggableGridItem';
import { generateTestingInventory } from '@/utils/test-data';
import { useServiceStore } from '@/store/game-store';
import { InventoryService } from '@/services/inventory.service';
import { BASE_AGENT_INVENTORY_HEIGHT, BASE_AGENT_INVENTORY_WIDTH } from '@/utils/constants';

export interface AgentConfigModalProps {
  agent: Agent;
}

export const AgentConfigModal: React.FC<AgentConfigModalProps> = ({ agent }) => {
  const { closeModal } = useModal();
  const { gameServiceLocator } = useServiceStore();

  const generateSampleItems = (): GridItem[] => {
    return generateTestingInventory().map((item) => ({ item }));
  };
  
  const handleGridChange = (newGrid: (GridItem | null)[][]) => {
    const inventoryUpdate = { ...agent.inventory, items: newGrid.map((row) => row.map((gridItem) => gridItem?.item || null)) };
    const inventoryService = gameServiceLocator.getService(InventoryService);
    inventoryService.refreshAgentFromItems(agent, inventoryUpdate);
  };
  
  return (
    <div className="flex flex-col h-full w-[80vw] max-w-6xl">
      <div className="p-4 bg-gray-900 text-white">
        <h2 className="text-xl font-bold text-emerald-400 mb-2">{agent.id}</h2>
        <p className="text-gray-300 mb-4">
          Configure this agent.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 h-[70vh]">
          <div className="flex-grow bg-gray-800 rounded-lg border border-emerald-700 shadow-lg">
            <DraggableGrid 
              gridWidth={BASE_AGENT_INVENTORY_WIDTH}
              gridHeight={BASE_AGENT_INVENTORY_HEIGHT}
              trayItems={generateSampleItems()}
              onGridChange={handleGridChange}
            />
          </div>
          
          <div className="w-full md:w-64 lg:w-80">
            <AgentStatPanel stats={agent.stats.baseStats} />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button 
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-white"
            onClick={closeModal}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};