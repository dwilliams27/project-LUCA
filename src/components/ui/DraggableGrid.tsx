import { DraggableGridItem, type GridItem } from '@/components/ui/DraggableGridItem';
import React, { useState, useRef } from 'react';

interface DraggableGridProps {
  gridSize: number; // N for an NxN grid
  trayItems: GridItem[];
  onGridChange?: (grid: (GridItem | null)[][]) => void;
}

export const DraggableGrid: React.FC<DraggableGridProps> = ({ 
  gridSize = 3, 
  trayItems = [],
  onGridChange
}) => {
  const [grid, setGrid] = useState<(GridItem | null)[][]>(
    Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  );

  const [draggedItem, setDraggedItem] = useState<GridItem | null>(null);
  const [availableItems, setAvailableItems] = useState<GridItem[]>(trayItems);
  
  // Reference to the original state before drag starts (for cancelation)
  const originalGridRef = useRef<(GridItem | null)[][]>([]);
  const originalAvailableItemsRef = useRef<GridItem[]>([]);

  const handleDragStart = (e: React.DragEvent, gridItem: GridItem, fromTray: boolean = true) => {    
    setDraggedItem({ ...gridItem, fromTray });
    originalGridRef.current = [...grid.map(row => [...row])];
    originalAvailableItemsRef.current = [...availableItems];
    
    // Set the drag image
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', gridItem.item.id);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent, rowIndex: number, colIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const newGrid = [...grid.map(row => [...row.map((i) => i?.item.id === draggedItem.item.id ? null : i)])];
    
    // If there's already an item in this cell, don't allow the drop
    if (newGrid[rowIndex][colIndex] !== null) return;
    
    if (draggedItem.fromTray) {
      const newAvailableItems = availableItems.filter(gridItem => gridItem.item.id !== draggedItem.item.id);
      setAvailableItems(newAvailableItems);
    }
  
    newGrid[rowIndex][colIndex] = draggedItem;
    setGrid(newGrid);

    setDraggedItem(null);
    if (onGridChange) {
      onGridChange(newGrid);
    }
  };

  const handleTrayDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    // Calculate drop position in the tray based on mouse coordinates
    const trayElement = e.currentTarget;
    const trayRect = trayElement.getBoundingClientRect();
    const dropX = e.clientX - trayRect.left;
    
    // Calculate the index based on the drop position
    const itemWidth = 64; // 16 * 4 = 64px (w-16)
    const itemGap = 8;   // space-x-2 = 8px
    const itemTotalWidth = itemWidth + itemGap;
    
    let dropIndex = Math.floor(dropX / itemTotalWidth);
    
    // Clamp to valid index range
    dropIndex = Math.max(0, Math.min(dropIndex, availableItems.length));
    
    // Handle item from grid
    if (!draggedItem.fromTray) {
      // Insert the item at the calculated index
      const newAvailableItems = [...availableItems];
      newAvailableItems.splice(dropIndex, 0, draggedItem);
      setAvailableItems(newAvailableItems);

      const newGrid = grid.map(row => 
        row.map(gridItem => gridItem?.item.id === draggedItem.item.id ? null : gridItem)
      );
      setGrid(newGrid);
      if (onGridChange) {
        onGridChange(newGrid);
      }
    } 
    // Handle reordering within the tray
    else {
      // Find current index of the dragged item
      const currentIndex = availableItems.findIndex(gridItem => gridItem.item.id === draggedItem.item.id);
      
      // Only proceed if the item is actually moving to a different position
      if (currentIndex !== -1 && currentIndex !== dropIndex) {
        // Remove from current position and insert at new position
        const newAvailableItems = [...availableItems];
        const [movedItem] = newAvailableItems.splice(currentIndex, 1);
        
        // Adjust drop index if moving from before to after
        const adjustedDropIndex = currentIndex < dropIndex ? dropIndex - 1 : dropIndex;
        
        newAvailableItems.splice(adjustedDropIndex, 0, movedItem);
        setAvailableItems(newAvailableItems);
      }
    }

    setDraggedItem(null);
  };
  
  // Allow a drop
  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Handle drag end (for when the user cancels the drag operation)
  const handleDragEnd = (e: React.DragEvent) => {
    if (!draggedItem) return;
    
    // Restore the original state if the drag was canceled
    if (e.dataTransfer.dropEffect === 'none') {
      // Simply restore from our saved original state
      setGrid(originalGridRef.current);
      setAvailableItems(originalAvailableItemsRef.current);
    }
    
    // Reset dragged item state
    setDraggedItem(null);
  };
  
  return (
    <div className="flex flex-col h-full w-full">
      {/* Main grid */}
      <div className="flex-grow mb-4 p-4 flex items-center justify-center">
        <div 
          className="grid border border-emerald-700 rounded-lg bg-gray-900 shadow-lg"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`, 
            width: `${gridSize * 5}rem`,
            height: `${gridSize * 5}rem`
          }}
        >
          {grid.map((row, rowIndex) => (
            row.map((gridItem, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`}
                className={`
                  border border-emerald-700/50 p-1 flex items-center justify-center
                  transition-all duration-200 
                  ${!gridItem ? 'hover:bg-emerald-900/20' : ''}
                `}
                style={{ width: '100%', height: '100%' }}
                onDragOver={allowDrop}
                onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
              >
                {gridItem ? (
                  <DraggableGridItem
                    onDragStart={(e) => handleDragStart(e, gridItem, false)}
                    onDragEnd={handleDragEnd}
                    gridItem={gridItem} />
                ) : null}
              </div>
            ))
          ))}
        </div>
      </div>
      
      {/* Bottom tray */}
      <div 
        className="h-24 p-2 bg-gray-800 border-t border-emerald-700 rounded-lg overflow-x-auto"
        onDragOver={allowDrop}
        onDrop={handleTrayDrop}
      >
        <div className="flex space-x-2 h-full items-center px-2">
          {availableItems.map((item) => (
            <DraggableGridItem
              onDragStart={(e) => handleDragStart(e, item, true)}
              onDragEnd={handleDragEnd}
              gridItem={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
