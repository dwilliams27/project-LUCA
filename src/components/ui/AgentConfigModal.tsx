import React, { useState } from 'react';
import { DraggableGrid, type GridItem } from './DraggableGrid';
import { useModal } from '@/contexts/modal-context';

import type { Agent } from '@/services/types/agent.service.types';

export interface AgentConfigModalProps {
  agent: Agent;
}

export const AgentConfigModal: React.FC<AgentConfigModalProps> = ({ agent }) => {
  const { closeModal } = useModal();
  
  // Generate sample items for the tray
  const generateSampleItems = (): GridItem[] => {
    const types: ('energy' | 'matter' | 'information')[] = ['energy', 'matter', 'information'];
    const qualities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    
    const items: GridItem[] = [];
    
    // Create one of each type and quality combination
    for (let i = 0; i < types.length; i++) {
      for (let j = 0; j < qualities.length; j++) {
        items.push({
          id: `item-${i}-${j}`,
          type: types[i],
          quality: qualities[j]
        });
      }
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