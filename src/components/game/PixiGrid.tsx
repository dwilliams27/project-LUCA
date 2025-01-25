import { PixiGridCell } from "@/components/game/PixiGridCell";
import { GRID_PADDING, VGridCell } from "@/types";
import { Container, Graphics } from '@pixi/react';
import { useCallback } from "react";

export const PixiGrid: React.FC<{
  grid: VGridCell[][];
  width: number;
  height: number;
}> = ({ grid, width, height }) => {
  const cellWidth = width / grid[0].length;
  const cellHeight = height / grid.length;

  const drawGrid = useCallback((g) => {
    g.clear();
    g.lineStyle(1, 0x00FF00);

    for (let yIndex = 0; yIndex <= grid.length; yIndex += 1) {
      g.moveTo(0, yIndex * cellHeight);
      g.lineTo(width, yIndex * cellHeight);
    }
    for (let xIndex = 0; xIndex <= grid[0].length; xIndex += 1) {
      g.moveTo(xIndex * cellWidth, 0);
      g.lineTo(xIndex * cellWidth, height);
    }
  }, [width, height]);

  return (
    <Container>
      <Graphics draw={drawGrid} zIndex={1} />
      <Container>
        {
          grid.map((row, yIndex) =>
            row.map((cell, xIndex) => (
              <PixiGridCell
                key={`${xIndex}-${yIndex}`}
                cell={cell}
                xIndex={xIndex}
                yIndex={yIndex}
                width={cellWidth}
                height={cellHeight}
              />
            ))
          )
        }
      </Container>
      
    </Container>
  );
};
