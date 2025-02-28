import { GridCellComponent } from "@/components/game/GridCell";
import { Container, Graphics } from '@pixi/react';
import { useCallback } from "react";

import type { GridCell } from "@/services/types/physics.service.types";

export const Grid: React.FC<{
  zIndex: number;
  cells: GridCell[][];
  width: number;
  height: number;
}> = ({ zIndex, cells, width, height }) => {
  const cellWidth = width / cells[0].length;
  const cellHeight = height / cells.length;

  const drawGrid = useCallback((g) => {
    g.clear();
    g.lineStyle(1, 0x00FF00);

    for (let yIndex = 0; yIndex <= cells.length; yIndex += 1) {
      g.moveTo(0, yIndex * cellHeight);
      g.lineTo(width, yIndex * cellHeight);
    }
    for (let xIndex = 0; xIndex <= cells[0].length; xIndex += 1) {
      g.moveTo(xIndex * cellWidth, 0);
      g.lineTo(xIndex * cellWidth, height);
    }
  }, [width, height]);

  return (
    <Container zIndex={zIndex} >
      <Graphics draw={drawGrid} zIndex={1} />
      <Container>
        {
          cells.map((row, yIndex) =>
            row.map((cell, xIndex) => (
              <GridCellComponent
                key={`${xIndex}-${yIndex}`}
                cell={cell}
              />
            ))
          )
        }
      </Container>
    </Container>
  );
};
