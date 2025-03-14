import { ImageService } from '@/services/image.service';
import type { LucaItem } from '@/services/types/inventory.service.types';
import { useServiceStore } from '@/store/game-store';
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
  const { gameServiceLocator } = useServiceStore();
  const imageService = gameServiceLocator.getService(ImageService);

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
        {imageService.getImage(gridItem.item.ui.displayImageName) ? (
          <img 
            src={`data:image/png;base64,${imageService.getImage(gridItem.item.ui.displayImageName)}`} 
            alt={gridItem.item.ui.displayText || 'Item image'} 
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <span className="text-white font-bold text-xs">
            {gridItem.item.ui.displayText}
          </span>
        )}
      </span>
    </div>
  );
};
