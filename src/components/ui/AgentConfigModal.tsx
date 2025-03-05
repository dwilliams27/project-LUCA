import React from 'react';
import { DraggableGrid } from './DraggableGrid';
import { useModal } from '@/contexts/modal-context';

import type { Agent } from '@/services/types/agent.service.types';
import type { GridItem } from '@/components/ui/DraggableGridItem';
import { genId, ITEM_ID } from '@/utils/id';

export interface AgentConfigModalProps {
  agent: Agent;
}

export const AgentConfigModal: React.FC<AgentConfigModalProps> = ({ agent }) => {
  const { closeModal } = useModal();

  const generateSampleItems = (): GridItem[] => {
    const items: GridItem[] = [];

    for (let i = 0; i < 5; i++) {
      items.push({
        item: {
          id: genId(ITEM_ID),
          name: 'Testing',
          description: '',
          boundAgentId: '',
          capabilities: [],
          inputStatPaths: [],
          statModifiers: {},
          calculateModifiers: () => {},
          dirty: false
        }
      });
    }
    
    return items;
  };
  
  const handleGridChange = (newGrid: (GridItem | null)[][]) => {
    console.log('Grid updated:', newGrid);
  };
  
  return (
    <div className="flex flex-col h-full w-[50vw]">
      <div className="p-4 bg-gray-900 text-white">
        <h2 className="text-xl font-bold text-emerald-400 mb-2">{agent.id}</h2>
        <p className="text-gray-300 mb-4">
          Configure this agent.
        </p>
        
        <div className="h-[70vh] bg-gray-800 rounded-lg border border-emerald-700 shadow-lg">
          <DraggableGrid 
            gridSize={4} 
            trayItems={generateSampleItems()}
            onGridChange={handleGridChange}
          />
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