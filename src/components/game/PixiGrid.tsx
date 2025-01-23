import { PixiGridCell } from "@/components/game/PixiGridCell";
import { CELL_SIZE, GRID_PADDING, VGridCell } from "@/types";
import { Stage, Container } from '@pixi/react';

export const PixiGrid: React.FC<{
  grid: VGridCell[][],
  width: number,
  height: number
}> = ({ grid, width, height }) => {
  const gridWidth = grid[0].length;
  const gridHeight = grid.length;
  const maxCellWidth = Math.floor((width - (gridWidth + 1) * GRID_PADDING) / gridWidth);
  const maxCellHeight = Math.floor((height - (gridHeight + 1) * GRID_PADDING) / gridHeight);
  console.log('maxCellWidth:', maxCellWidth, 'maxCellHeight:', maxCellHeight);
  const cellSize = Math.min(maxCellWidth, maxCellHeight, CELL_SIZE);

  // Recalculate total size based on cell size
  const totalWidth = (gridWidth * (cellSize + GRID_PADDING)) + GRID_PADDING;
  const totalHeight = (gridHeight * (cellSize + GRID_PADDING)) + GRID_PADDING;
  return (
    <Container>
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <PixiGridCell
            key={`${x}-${y}`}
            cell={cell}
            size={cellSize}
            x={x}
            y={y}
          />
        ))
      )}
    </Container>
  );
};
