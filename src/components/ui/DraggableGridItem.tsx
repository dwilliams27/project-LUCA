import type { LucaItem } from '@/services/types/inventory.service.types';
import React, { type DragEventHandler } from 'react';

export interface GridItem {
  item: LucaItem;
  fromTray?: boolean;
}

interface DraggableGridItemProps {
  gridItem: GridItem;
  onDragStart: DragEventHandler<HTMLDivElement>;
  onDragEnd: DragEventHandler<HTMLDivElement>;
}

export const DraggableGridItem: React.FC<DraggableGridItemProps> = ({ 
  gridItem,
  onDragStart,
  onDragEnd
}) => {  
  return (
    <div
      className={`
        w-full h-full rounded-md
        flex items-center justify-center border-2 border-gray-700
        shadow-md cursor-grab transition-transform duration-150
        hover:scale-105
      `}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <span className="text-white font-bold text-xs">
        {gridItem.item.name}
      </span>
    </div>
  );
};